import postgres from "../../services/postgres.js";
import { getFileFormatCode } from "../../parameters.ts";
import { TABLE as TEMPLATE_TABLE } from "./template.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { DataType, TABLE as REVIEW_TABLE } from "../users/data_review.ts";

export const TABLE = "ARCHIVOS.ARCHIVO_PLANTILLA";

export class TemplateFile {
  constructor(
    public readonly template: number,
    public readonly user: number,
    public name: string,
    public upload_date: Date,
  ) {}
}

export const upsert = async (
  template: number,
  user: number,
  name: string,
): Promise<TemplateFile> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PLANTILLA,
      FK_USUARIO,
      NOMBRE_ARCHIVO,
      FEC_CARGA
    ) VALUES (
      $1,
      $2,
      $3,
      NOW()
    ) ON CONFLICT (FK_PLANTILLA, FK_USUARIO)
    DO UPDATE SET
      NOMBRE_ARCHIVO = $3,
      FEC_CARGA = NOW()
    RETURNING FEC_CARGA`,
    template,
    user,
    name,
  );

  const upload_date: Date = rows[0][0];

  return new TemplateFile(
    template,
    user,
    name,
    upload_date,
  );
};

export const findByTemplateAndUser = async (
  template: number,
  user: number,
): Promise<TemplateFile | null> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_PLANTILLA,
      FK_USUARIO,
      NOMBRE_ARCHIVO,
      FEC_CARGA
    FROM ${TABLE}
    WHERE FK_PLANTILLA = $1
    AND FK_USUARIO = $2`,
    template,
    user,
  );

  if (!rows.length) return null;

  return new TemplateFile(
    ...rows[0] as [
      number,
      number,
      string,
      Date,
    ],
  );
};

export class FileHistory {
  constructor(
    public readonly id: number,
    public readonly template: string,
    public readonly upload_date: string | null,
    public readonly observations: string | null,
    public readonly review_status: number,
  ) {}
}

export const generateFileReviewTable = (
  person: number,
  format?: number,
) =>
  async (
    order: TableOrder,
    page: number,
    rows: number | null,
    filters: { [key: string]: string },
    search: { [key: string]: string },
  ): Promise<TableResult> => {
    const base_query = (
      `SELECT
      T.PK_PLANTILLA AS ID,
      T.NOMBRE AS TEMPLATE,
      F.FEC_CARGA AS UPLOAD_DATE,
      RS.OBSERVACION AS OBSERVATIONS,
      CASE
        WHEN F.FK_USUARIO IS NULL THEN 3
        WHEN RS.BAN_APROBADO = TRUE THEN 1
        WHEN RS.BAN_APROBADO = FALSE AND RS.OBSERVACION IS NOT NULL THEN 0
        ELSE 2
      END AS REVIEW_STATUS
    FROM ${TEMPLATE_TABLE} T
    LEFT JOIN ${TABLE} F
      ON T.PK_PLANTILLA = F.FK_PLANTILLA
      AND F.FK_USUARIO = ${person}
    LEFT JOIN ${REVIEW_TABLE} RS
      ON RS.TIPO_FORMULARIO = '${DataType.DATOS_SOPORTES}'
      AND RS.FK_DATOS = F.FK_USUARIO||'_'||T.PK_PLANTILLA
    ${format ? `WHERE T.FK_FORMATO = ${format}` : ""}`
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
      string | null,
      string | null,
      number,
    ]) => new FileHistory(...x));

    return new TableResult(
      count,
      models,
    );
  };

export class FileReview {
  constructor(
    public readonly id: string,
    public readonly person: number,
    public readonly template: string,
    public readonly review_status: number,
  ) {}
}

export const getPersonFileReviewTable = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const file_format = await getFileFormatCode();

  const base_query = (
    `SELECT
        F.FK_USUARIO||'_'||T.PK_PLANTILLA AS ID,
        F.FK_USUARIO AS PERSON,
        T.NOMBRE AS TEMPLATE,
        CASE
          WHEN RS.BAN_APROBADO = TRUE THEN 1
          WHEN RS.BAN_APROBADO = FALSE AND RS.OBSERVACION IS NOT NULL THEN 0
          ELSE 2
        END AS REVIEW_STATUS
      FROM ${TABLE} F
      JOIN ${TEMPLATE_TABLE} T
        ON T.PK_PLANTILLA = F.FK_PLANTILLA
        AND T.FK_FORMATO = ${file_format}
      LEFT JOIN ${REVIEW_TABLE} RS
        ON RS.TIPO_FORMULARIO = '${DataType.DATOS_SOPORTES}'
        AND RS.FK_DATOS = F.FK_USUARIO||'_'||T.PK_PLANTILLA`
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
    string,
    number,
    string,
    number,
  ]) => new FileReview(...x));

  return new TableResult(
    count,
    models,
  );
};
