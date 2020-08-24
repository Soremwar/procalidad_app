import postgres from "../../services/postgres.js";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

export const TABLE = "ARCHIVOS.FORMATO";

class Format {
  constructor(
    public readonly id: number,
    public name: string,
    public path: string,
    public size: string,
    public extensions: string[],
  ) {}

  async update(
    name: string = this.name,
    size: string = this.size,
    extensions: string[] = this.extensions,
  ): Promise<Format> {
    Object.assign(this, {
      name,
      size,
      extensions,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        MAX_TAMANO = $3,
        EXTENSIONES = '{${this.extensions.join(",")}}'
      WHERE PK_FORMATO = $1`,
      this.id,
      this.name,
      this.size,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_FORMATO = $1`,
      this.id,
    );
  }
}

export const createNew = async (
  name: string,
  path: string,
  size: string,
  extensions: string[],
): Promise<Format> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      RUTA,
      MAX_TAMANO,
      EXTENSIONES
    ) VALUES (
      $1,
      $2,
      $3,
      '{${extensions.join(",")}}'
    ) RETURNING PK_FORMATO`,
    name,
    path,
    size,
  );

  const id: number = rows[0][0];

  return new Format(
    id,
    name,
    path,
    size,
    extensions,
  );
};

export const findAll = async (): Promise<Format[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_FORMATO,
      NOMBRE,
      RUTA,
      MAX_TAMANO,
      EXTENSIONES
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
    string,
    string,
    string[],
  ]) => new Format(...row));
};

export const findById = async (id: number): Promise<Format | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_FORMATO,
      NOMBRE,
      RUTA,
      MAX_TAMANO,
      EXTENSIONES
    FROM ${TABLE}
    WHERE PK_FORMATO = $1`,
    id,
  );

  if (!rows.length) return null;

  return new Format(
    ...rows[0] as [
      number,
      string,
      string,
      string,
      string[],
    ],
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public path: string,
    public size: string,
    public extensions: string,
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
      PK_FORMATO AS ID,
      NOMBRE AS NAME,
      RUTA AS PATH,
      MAX_TAMANO AS SIZE,
      ARRAY_TO_STRING(EXTENSIONES, ', ') AS EXTENSIONS
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
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
