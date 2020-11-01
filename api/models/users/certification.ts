import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as GENERIC_FILE_TABLE } from "../files/generic_file.ts";
import { TABLE as TYPE_TABLE } from "./certification_type.ts";
import { TABLE as TEMPLATE_TABLE } from "./certification_template.ts";
import { DataType, TABLE as REVIEW_TABLE } from "./data_review.ts";

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
    protected approved: boolean | null,
    protected observations: string | null,
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
    null,
    null,
  );
};

export const getAll = async (
  user?: number,
): Promise<Certification[]> => {
  const { rows } = await postgres.query(
    `SELECT
      C.PK_CERTIFICACION,
      C.FK_USUARIO,
      C.FK_PLANTILLA,
      C.FK_TIPO,
      C.NOMBRE,
      C.VERSION,
      TO_CHAR(C.FEC_CERTIFICACION, 'YYYY-MM-DD'),
      TO_CHAR(C.FEC_EXPIRACION, 'YYYY-MM-DD'),
      C.FK_ARCHIVO_GENERICO
    FROM ${TABLE} C
    LEFT JOIN ${REVIEW_TABLE} R
      ON C.PK_CERTIFICACION::VARCHAR = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.CERTIFICACION}'
    ${user ? `WHERE C.FK_USUARIO = ${user}` : ""}`,
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
    boolean | null,
    string | null,
  ]) => new Certification(...row));
};

export const findById = async (
  id: number,
): Promise<Certification | null> => {
  const { rows } = await postgres.query(
    `SELECT
      C.PK_CERTIFICACION,
      C.FK_USUARIO,
      C.FK_PLANTILLA,
      C.FK_TIPO,
      C.NOMBRE,
      C.VERSION,
      TO_CHAR(C.FEC_CERTIFICACION, 'YYYY-MM-DD'),
      TO_CHAR(C.FEC_EXPIRACION, 'YYYY-MM-DD'),
      C.FK_ARCHIVO_GENERICO
    FROM ${TABLE} C
    LEFT JOIN ${REVIEW_TABLE} R
      ON C.PK_CERTIFICACION::VARCHAR = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.CERTIFICACION}'
    WHERE C.PK_CERTIFICACION = $1`,
    id,
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
      boolean | null,
      string | null,
    ],
  );
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<Certification | null> => {
  const { rows } = await postgres.query(
    `SELECT
      C.PK_CERTIFICACION,
      C.FK_USUARIO,
      C.FK_PLANTILLA,
      C.FK_TIPO,
      C.NOMBRE,
      C.VERSION,
      TO_CHAR(C.FEC_CERTIFICACION, 'YYYY-MM-DD'),
      TO_CHAR(C.FEC_EXPIRACION, 'YYYY-MM-DD'),
      C.FK_ARCHIVO_GENERICO
    FROM ${TABLE} C
    LEFT JOIN ${REVIEW_TABLE} R
      ON C.PK_CERTIFICACION::VARCHAR = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.CERTIFICACION}'
    WHERE C.PK_CERTIFICACION = $1
    AND C.FK_USUARIO = $2`,
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
      boolean | null,
      string | null,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly template: string,
    public readonly type: string,
    public readonly name: string,
    public readonly version: string,
    public readonly file: {
      id: number;
      extensions: string[];
    },
    public readonly upload_date: string,
    public readonly review_status: number,
  ) {}
}

export const generateTableData = (
  user_id?: number,
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
        C.PK_CERTIFICACION AS ID,
        C.FK_USUARIO AS PERSON,
        (SELECT NOMBRE FROM ${TEMPLATE_TABLE} WHERE PK_PLANTILLA = C.FK_PLANTILLA) AS TEMPLATE,
        (SELECT NOMBRE FROM ${TYPE_TABLE} WHERE PK_TIPO = C.FK_TIPO) AS TYPE,
        C.NOMBRE AS NAME,
        C.VERSION AS VERSION,
        C.FK_ARCHIVO_GENERICO,
        F.EXTENSIONES,
        F.FEC_CARGA AS UPLOAD_DATE,
        CASE
          WHEN R.BAN_APROBADO = FALSE AND R.OBSERVACION IS NOT NULL THEN 0
          WHEN R.BAN_APROBADO = TRUE THEN 1
          WHEN C.FK_ARCHIVO_GENERICO IS NULL THEN 3
          ELSE 2
        END AS REVIEW_STATUS
      FROM ${TABLE} AS C
      LEFT JOIN ${GENERIC_FILE_TABLE} AS F
        ON F.PK_ARCHIVO = C.FK_ARCHIVO_GENERICO
      LEFT JOIN ${REVIEW_TABLE} R
        ON C.PK_CERTIFICACION::VARCHAR = R.FK_DATOS
        AND R.TIPO_FORMULARIO = '${DataType.CERTIFICACION}'
      ${user_id ? `WHERE C.FK_USUARIO = ${user_id}` : ""}`
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
      number,
      string,
      string,
      string,
      string,
      number,
      string[],
      string,
      number,
    ]) =>
      new TableData(
        x[0],
        x[1],
        x[2],
        x[3],
        x[4],
        x[5],
        {
          id: x[6],
          extensions: x[7],
        },
        x[8],
        x[9],
      )
    );

    return new TableResult(
      count,
      models,
    );
  };
};
