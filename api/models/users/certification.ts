import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as GENERIC_FILE_TABLE } from "../files/generic_file.ts";
import { TABLE as TYPE_TABLE } from "./certification_type.ts";
import { TABLE as TEMPLATE_TABLE } from "./certification_template.ts";

export const TABLE = "USUARIOS.CERTIFICACION";

export class Certification {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public readonly template: number,
    public type: number,
    public name: string,
    public version: string | null,
    /** YYYY-MM-DD date string */
    public expedition_date: string,
    /** YYYY-MM-DD date string */
    public expiration_date: string | null,
    public generic_file: number | null,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_CERTIFICACION = $1`,
      this.id,
    );
  }

  static async nameIsTaken(
    user_id: number,
    template_id: number,
    type_id: number,
    name: string,
    version: string,
    exclude = 0,
  ) {
    const { rows } = await postgres.query(
      `SELECT
        COUNT(1)
      FROM ${TABLE}
      WHERE PK_CERTIFICACION <> $1
      AND FK_USUARIO = $2
      AND FK_PLANTILLA = $3
      AND FK_TIPO = $4
      AND UPPER(NOMBRE) = UPPER($5)
      AND COALESCE(VERSION, '') = $6`,
      exclude,
      user_id,
      template_id,
      type_id,
      name,
      version,
    );

    return rows[0][0] > 0;
  }

  async update(
    type = this.type,
    name = this.name,
    expedition_date = this.expedition_date,
    expiration_date = this.expiration_date,
    generic_file = this.generic_file,
  ): Promise<Certification> {
    Object.assign(this, {
      type,
      name,
      expedition_date,
      expiration_date,
      generic_file,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_TIPO = $2,
        NOMBRE = $3,
        FEC_CERTIFICACION = $4,
        FEC_EXPIRACION = $5,
        FK_ARCHIVO_GENERICO = $6
      WHERE PK_CERTIFICACION = $1`,
      this.id,
      this.type,
      this.name,
      this.expedition_date,
      this.expiration_date,
      this.generic_file,
    );

    return this;
  }
}

/**
 * @param expedition_date YYYY-MM-DD date string
 * @param expiration_date YYYY-MM-DD date string
 */
export const create = async (
  user: number,
  template: number,
  type: number,
  name: string,
  version: string | null,
  expedition_date: string,
  expiration_date: string | null,
): Promise<Certification> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      FK_PLANTILLA,
      FK_TIPO,
      NOMBRE,
      VERSION,
      FEC_CERTIFICACION,
      FEC_EXPIRACION
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    ) RETURNING PK_CERTIFICACION`,
    user,
    template,
    type,
    name,
    version,
    expedition_date,
    expiration_date,
  );

  const id: number = rows[0][0];

  return new Certification(
    id,
    user,
    template,
    type,
    name,
    version,
    expedition_date,
    expiration_date,
    null,
  );
};

export const getAll = async (
  user?: number,
): Promise<Certification[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CERTIFICACION,
      FK_USUARIO,
      FK_PLANTILLA,
      FK_TIPO,
      NOMBRE,
      VERSION,
      TO_CHAR(FEC_CERTIFICACION, 'YYYY-MM-DD'),
      TO_CHAR(FEC_EXPIRACION, 'YYYY-MM-DD'),
      FK_ARCHIVO_GENERICO
    FROM ${TABLE}
    ${user ? `WHERE FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    number,
    string,
    string | null,
    string,
    string | null,
    number | null,
  ]) => new Certification(...row));
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<Certification | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CERTIFICACION,
      FK_USUARIO,
      FK_PLANTILLA,
      FK_TIPO,
      NOMBRE,
      VERSION,
      TO_CHAR(FEC_CERTIFICACION, 'YYYY-MM-DD'),
      TO_CHAR(FEC_EXPIRACION, 'YYYY-MM-DD'),
      FK_ARCHIVO_GENERICO
    FROM ${TABLE}
    WHERE PK_CERTIFICACION = $1
    AND FK_USUARIO = $2`,
    id,
    user,
  );

  if (!rows.length) return null;

  return new Certification(
    ...rows[0] as [
      number,
      number,
      number,
      number,
      string,
      string | null,
      string,
      string | null,
      number | null,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly template: string,
    public readonly type: string,
    public readonly name: string,
    public readonly version: string,
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
        T.PK_CERTIFICACION AS ID,
        (SELECT NOMBRE FROM ${TEMPLATE_TABLE} WHERE PK_PLANTILLA = T.FK_PLANTILLA) AS TEMPLATE,
        (SELECT NOMBRE FROM ${TYPE_TABLE} WHERE PK_TIPO = T.FK_TIPO) AS TYPE,
        T.NOMBRE AS NAME,
        T.VERSION AS VERSION,
        T.FK_ARCHIVO_GENERICO,
        F.EXTENSIONES,
        F.FEC_CARGA AS UPLOAD_DATE
      FROM ${TABLE} AS T
      LEFT JOIN ${GENERIC_FILE_TABLE} AS F
        ON F.PK_ARCHIVO = T.FK_ARCHIVO_GENERICO
      AND T.FK_USUARIO = ${user_id}`
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
        x[4],
        {
          id: x[5],
          extensions: x[6],
        },
        x[7],
      )
    );

    return new TableResult(
      count,
      models,
    );
  };
};
