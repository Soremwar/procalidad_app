import postgres from "../../services/postgres.js";
import { TABLE as TEMPLATE_TABLE } from "./template.ts";

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

class FileHistory {
  constructor(
    public readonly template_id: number,
    public readonly template: string,
    public readonly upload_date: Date | null,
  ) {}
}

export const getFileHistory = async (
  format?: number,
  person?: number,
): Promise<FileHistory[]> => {
  const { rows } = await postgres.query(
    `SELECT
      T.PK_PLANTILLA,
      T.NOMBRE,
      F.FEC_CARGA
    FROM ${TEMPLATE_TABLE} T
    LEFT JOIN ${TABLE} F
      ON T.PK_PLANTILLA = F.FK_PLANTILLA
      ${person ? `AND F.FK_USUARIO = ${person}` : ""}
    ${format ? `WHERE T.FK_FORMATO = ${format}` : ""}`,
  );

  return rows.map((row: [
    number,
    string,
    Date | null,
  ]) => new FileHistory(...row));
};
