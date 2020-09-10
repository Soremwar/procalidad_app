import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as GENERIC_FILE_TABLE } from "../files/generic_file.ts";
import { TABLE as POSITION_TABLE } from "../ORGANIZACION/cargo.ts";
import { TABLE as SECTOR_TABLE } from "../CLIENTES/SECTOR.ts";

export const TABLE = "USUARIOS.EXPERIENCIA_LABORAL";

class LaboralExperience {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public readonly company: string,
    public sector: number,
    public city: number,
    public phone: string,
    public start_date: string,
    public end_date: string,
    public position: string,
    public homologous_position: number,
    public description: string,
    public generic_file: number | null,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
    );
  }

  async update(
    sector: number = this.sector,
    city: number = this.city,
    phone: string = this.phone,
    start_date: string = this.start_date,
    end_date: string = this.end_date,
    position: string = this.position,
    homologous_position: number = this.homologous_position,
    description: string = this.description,
    generic_file: number | null = this.generic_file,
  ) {
    Object.assign(this, {
      sector,
      city,
      phone,
      start_date,
      end_date,
      position,
      homologous_position,
      description,
      generic_file,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_SECTOR = $2,
        FK_CIUDAD = $3,
        TELEFONO = $4,
        FEC_INICIO = $5,
        FEC_FIN = $6,
        CARGO = $7,
        FK_CARGO_HOMOLOGO = $8,
        DESCRIPCION_CARGO = $9,
        FK_ARCHIVO_GENERICO = $10
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
      this.sector,
      this.city,
      this.phone,
      this.start_date,
      this.end_date,
      this.position,
      this.homologous_position,
      this.description,
      this.generic_file,
    );

    return this;
  }
}

export const create = async (
  user: number,
  company: string,
  sector: number,
  city: number,
  phone: string,
  start_date: string,
  end_date: string,
  position: string,
  homologous_position: number,
  description: string,
): Promise<LaboralExperience> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      EMPRESA,
      FK_SECTOR,
      FK_CIUDAD,
      TELEFONO,
      FEC_INICIO,
      FEC_FIN,
      CARGO,
      FK_CARGO_HOMOLOGO,
      DESCRIPCION_CARGO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    ) RETURNING PK_EXPERIENCIA`,
    user,
    company,
    sector,
    city,
    phone,
    start_date,
    end_date,
    position,
    homologous_position,
    description,
  );

  const id: number = rows[0][0];

  return new LaboralExperience(
    id,
    user,
    company,
    sector,
    city,
    phone,
    start_date,
    end_date,
    position,
    homologous_position,
    description,
    null,
  );
};

export const getAll = async (
  user?: number,
): Promise<LaboralExperience[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_EXPERIENCIA,
      FK_USUARIO,
      EMPRESA,
      FK_SECTOR,
      FK_CIUDAD,
      TELEFONO,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
      CARGO,
      FK_CARGO_HOMOLOGO,
      DESCRIPCION_CARGO
    FROM ${TABLE}
    ${user ? `WHERE FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    number,
    string,
    string,
    string,
    string,
    number,
    string,
    number | null,
  ]) => new LaboralExperience(...row));
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<LaboralExperience | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_EXPERIENCIA,
      FK_USUARIO,
      EMPRESA,
      FK_SECTOR,
      FK_CIUDAD,
      TELEFONO,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
      CARGO,
      FK_CARGO_HOMOLOGO,
      DESCRIPCION_CARGO
    FROM ${TABLE}
    WHERE PK_EXPERIENCIA = $1
    AND FK_USUARIO = $2`,
    id,
    user,
  );

  return new LaboralExperience(
    ...rows[0] as [
      number,
      number,
      string,
      number,
      number,
      string,
      string,
      string,
      string,
      number,
      string,
      number | null,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly sector: string,
    public readonly company: string,
    public readonly position: string,
    public readonly file: {
      id: number;
      extensions: string[];
    },
    public readonly upload_date: string,
  ) {}
}

export const generateTableData = (
  user_id: number,
) => {
  return async (
    order: TableOrder,
    page: number,
    rows: number | null,
    filters: { [key: string]: string },
    search: { [key: string]: string },
  ): Promise<TableResult> => {
    const base_query = (
      `SELECT
        E.PK_EXPERIENCIA AS ID,
        (SELECT NOMBRE FROM ${SECTOR_TABLE} WHERE PK_SECTOR = E.FK_SECTOR) AS SECTOR,
        E.EMPRESA,
        (SELECT NOMBRE FROM ${POSITION_TABLE} WHERE PK_CARGO = E.FK_CARGO_HOMOLOGO) AS POSITION,
        E.FK_ARCHIVO_GENERICO,
        F.EXTENSIONES,
        F.FEC_CARGA AS UPLOAD_DATE
      FROM ${TABLE} AS E
      LEFT JOIN ${GENERIC_FILE_TABLE} AS F
        ON F.PK_ARCHIVO = E.FK_ARCHIVO_GENERICO
      WHERE E.FK_USUARIO = ${user_id}`
    );

    const { count, data } = await getTableModels(
      base_query,
      order,
      page,
      rows,
      filters,
      search,
    );

    const models = data.map((x: [
      number,
      string,
      string,
      string,
      number,
      string[],
      string,
    ]) =>
      new TableData(
        x[0],
        x[1],
        x[2],
        x[3],
        {
          id: x[4],
          extensions: x[5],
        },
        x[6],
      )
    );

    return new TableResult(
      count,
      models,
    );
  };
};
