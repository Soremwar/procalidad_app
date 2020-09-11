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
    public readonly company_name: string,
    public company_nit: number,
    public company_verification_digit: number,
    public company_sector: number,
    public company_city: number,
    public company_address: string,
    public company_phone: number,
    public contact: string,
    public start_date: string,
    public end_date: string,
    public position: string,
    public function_description: string,
    public achievement_description: string,
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
    company_nit: number = this.company_nit,
    company_verification_digit: number = this.company_verification_digit,
    company_sector: number = this.company_sector,
    company_city: number = this.company_city,
    company_address: string = this.company_address,
    company_phone: number = this.company_phone,
    contact: string = this.contact,
    start_date: string = this.start_date,
    end_date: string = this.end_date,
    position: string = this.position,
    function_description: string = this.function_description,
    achievement_description: string = this.achievement_description,
    generic_file: number | null = this.generic_file,
  ) {
    Object.assign(this, {
      company_nit,
      company_verification_digit,
      company_sector,
      company_city,
      company_address,
      company_phone,
      contact,
      start_date,
      end_date,
      position,
      function_description,
      achievement_description,
      generic_file,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NIT = $2,
        D_VERIFICACION = $3,
        FK_SECTOR = $4,
        FK_CIUDAD = $5,
        DIRECCION = $6,
        TELEFONO = $7,
        CONTACTO = $8,
        FEC_INICIO = $9,
        FEC_FIN = $10,
        CARGO = $11,
        DES_FUNCIONES = $12,
        DES_LOGROS = $13,
        FK_ARCHIVO_GENERICO = $14
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
      this.company_nit,
      this.company_verification_digit,
      this.company_sector,
      this.company_city,
      this.company_address,
      this.company_phone,
      this.contact,
      this.start_date,
      this.end_date,
      this.position,
      this.function_description,
      this.achievement_description,
      this.generic_file,
    );

    return this;
  }
}

export const create = async (
  user: number,
  company_name: string,
  company_nit: number,
  company_verification_digit: number,
  company_sector: number,
  company_city: number,
  company_address: string,
  company_phone: number,
  contact: string,
  start_date: string,
  end_date: string,
  position: string,
  function_description: string,
  achievement_description: string,
): Promise<LaboralExperience> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      EMPRESA,
      NIT,
      D_VERIFICACION,
      FK_SECTOR,
      FK_CIUDAD,
      DIRECCION,
      TELEFONO,
      CONTACTO,
      FEC_INICIO,
      FEC_FIN,
      CARGO,
      DES_FUNCIONES,
      DES_LOGROS
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
      $10,
      $11,
      $12,
      $13,
      $14
    ) RETURNING PK_EXPERIENCIA`,
    user,
    company_name,
    company_nit,
    company_verification_digit,
    company_sector,
    company_city,
    company_address,
    company_phone,
    contact,
    start_date,
    end_date,
    position,
    function_description,
    achievement_description,
  );

  const id: number = rows[0][0];

  return new LaboralExperience(
    id,
    user,
    company_name,
    company_nit,
    company_verification_digit,
    company_sector,
    company_city,
    company_address,
    company_phone,
    contact,
    start_date,
    end_date,
    position,
    function_description,
    achievement_description,
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
      NIT,
      D_VERIFICACION,
      FK_SECTOR,
      FK_CIUDAD,
      DIRECCION,
      TELEFONO,
      CONTACTO,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
      CARGO,
      DES_FUNCIONES,
      DES_LOGROS,
      FK_ARCHIVO_GENERICO
    FROM ${TABLE}
    ${user ? `WHERE FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    number,
    number,
    number,
    string,
    number,
    string,
    string,
    string,
    string,
    string,
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
      NIT,
      D_VERIFICACION,
      FK_SECTOR,
      FK_CIUDAD,
      DIRECCION,
      TELEFONO,
      CONTACTO,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
      CARGO,
      DES_FUNCIONES,
      DES_LOGROS,
      FK_ARCHIVO_GENERICO
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
      number,
      number,
      string,
      number,
      string,
      string,
      string,
      string,
      string,
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
      number,
      string[],
      string,
    ]) =>
      new TableData(
        x[0],
        x[1],
        x[2],
        {
          id: x[3],
          extensions: x[4],
        },
        x[5],
      )
    );

    return new TableResult(
      count,
      models,
    );
  };
};
