import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const TABLE = "MAESTRO.PARAMETRO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el parametro por que hay componentes que dependen de el";

export enum TipoParametro {
  string = "string",
  number = "number",
}

class Parametro {
  constructor(
    public readonly pk_parametro: number,
    public readonly nombre: string,
    public readonly descripcion: string,
    public readonly tipo_parametro: TipoParametro,
  ) {}

  async update(
    pk_parametro: number = this.pk_parametro,
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
    tipo_parametro: TipoParametro = this.tipo_parametro,
  ): Promise<Parametro> {
    Object.assign(this, {
      pk_parametro,
      nombre,
      descripcion,
      tipo_parametro,
    });
    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3,
        TIPO_PARAMETRO = $4
      WHERE PK_PARAMETRO = $1`,
      this.pk_parametro,
      this.nombre,
      this.descripcion,
      this.tipo_parametro,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PARAMETRO = $1`,
      this.pk_parametro,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Parametro[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PARAMETRO,
      NOMBRE,
      DESCRIPCION,
      TIPO_PARAMETRO
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
    TipoParametro,
  ]) => {
    row[3] = row[3] in TipoParametro
      ? row[3]
      : TipoParametro.string;
    return new Parametro(...row);
  });

  return models;
};

export const findById = async (id: number): Promise<Parametro | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PARAMETRO,
      NOMBRE,
      DESCRIPCION,
      TIPO_PARAMETRO
    FROM ${TABLE}
    WHERE PK_PARAMETRO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    string,
    string,
    TipoParametro,
  ] = rows[0];
  result[3] = result[3] in TipoParametro
    ? result[3]
    : TipoParametro.string;

  return new Parametro(...result);
};

export const createNew = async (
  nombre: string,
  descripcion: string,
  tipo_parametro: TipoParametro,
): Promise<Parametro> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION,
      TIPO_PARAMETRO
    ) VALUES ($1, $2, $3)
    RETURNING PK_PARAMETRO`,
    nombre,
    descripcion,
    tipo_parametro,
  );

  const id: number = rows[0][0];

  return new Parametro(id, nombre, descripcion, tipo_parametro);
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: string,
): Promise<TableData[]> => {
  //TODO
  //Replace search string with search object passed from the frontend table definition

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (
      SELECT
        PK_PARAMETRO AS ID,
        NOMBRE AS NAME,
        DESCRIPCION AS DESCRIPTION,
        TIPO_PARAMETRO AS TYPE
      FROM ${TABLE}
    ) AS TOTAL` +
    " " +
    `WHERE UNACCENT(NAME) ILIKE '%${search}%' OR UNACCENT(DESCRIPTION) ILIKE '%${search}%'` +
    " " +
    (Object.values(order).length
      ? `ORDER BY ${Object.entries(order).map(([column, order]) =>
        `${column} ${order}`
      ).join(", ")}`
      : "") +
    " " +
    (rows ? `OFFSET ${rows * page} LIMIT ${rows}` : "");

  const { rows: result } = await postgres.query(query);

  const models = result.map((x: [
    number,
    string,
    string,
    string,
  ]) => new TableData(...x));

  return models;
};