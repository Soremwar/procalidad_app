import postgres from "../../services/postgres.js";
import { TABLE as ASSET_TABLE } from "./asset.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as FORMAT_TABLE } from "../files/asset.ts";

export const TABLE = "ARCHIVOS.PLANTILLA";

class Template {
  constructor(
    public readonly id: number,
    readonly asset: number,
    readonly name: string,
    readonly prefix: string,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_PLANTILLA = $1`,
      this.id,
    );
  }

  async getPath(): Promise<string> {
    const { rows } = await postgres.query(
      `SELECT
        F.RUTA
      FROM ${TABLE} P
      JOIN ${ASSET_TABLE} F
        ON F.PK_FORMATO = P.FK_FORMATO
      WHERE PK_PLANTILLA = $1`,
      this.id,
    );

    return rows[0][0];
  }

  async update(
    name: string,
  ): Promise<Template> {
    Object.assign(this, {
      name,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2
      WHERE PK_PLANTILLA = $1`,
      this.id,
      this.name,
    );

    return this;
  }
}

export const create = async (
  format: number,
  name: string,
  prefix: string,
): Promise<Template> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_FORMATO,
      NOMBRE,
      PREFIJO_ARCHIVO
    )VALUES(
      $1,
      $2,
      $3
    ) RETURNING PK_PLANTILLA`,
    format,
    name,
    prefix,
  );

  const id: number = rows[0][0];

  return new Template(
    id,
    format,
    name,
    prefix,
  );
};

/*
* {format} should be always provided to ensure sensitive data is not leaked
* */
export const findById = async (
  id: number,
  format?: number,
): Promise<Template | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PLANTILLA,
      FK_FORMATO,
      NOMBRE,
      PREFIJO_ARCHIVO
    FROM ${TABLE}
    WHERE PK_PLANTILLA = $1
    ${format ? `AND FK_FORMATO = ${format}` : ""}`,
    id,
  );

  if (!rows.length) return null;

  return new Template(
    ...rows[0] as [
      number,
      number,
      string,
      string,
    ],
  );
};

/*
* {format} should alway be provided since the storage system is not accesible directly
* through the API, but rather abstracted through the format system
* */
export const getAll = async (
  format?: number,
): Promise<Template[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PLANTILLA,
      FK_FORMATO,
      NOMBRE,
      PREFIJO_ARCHIVO
    FROM ${TABLE}
    ${format ? `WHERE FK_FORMATO = ${format}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    string,
  ]) => new Template(...row));
};

class TableData {
  constructor(
    public id: number,
    public format: string,
    public name: string,
    public prefix: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
        PK_PLANTILLA AS ID,
        (SELECT NOMBRE FROM ${FORMAT_TABLE} WHERE PK_FORMATO = FK_FORMATO) AS FORMAT,
        NOMBRE AS NAME,
        PREFIJO_ARCHIVO AS PREFIX
      FROM ${TABLE}`
  );

  const { count, data } = await getTableModels(
    base_query,
    order,
    page,
    rows,
    search,
  );

  const models = data.map((x: [
    number,
    string,
    string,
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
