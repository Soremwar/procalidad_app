import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

export const TABLE = "OPERACIONES.ROL";
const ERROR_DEPENDENCY =
  "No se puede eliminar el rol por que hay componentes que dependen de el";

class Rol {
  constructor(
    public readonly pk_rol: number,
    public nombre: string,
    public descripcion: string,
  ) {}

  async update(
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
  ): Promise<
    Rol
  > {
    Object.assign(this, { nombre, descripcion });
    await postgres.query(
      `UPDATE ${TABLE} SET NOMBRE = $2, DESCRIPCION = $3 WHERE PK_ROL = $1`,
      this.pk_rol,
      this.nombre,
      this.descripcion,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_ROL = $1`,
      this.pk_rol,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Rol[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_ROL, NOMBRE, DESCRIPCION FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
  ]) => new Rol(...row));

  return models;
};

export const findById = async (id: number): Promise<Rol | null> => {
  const { rows } = await postgres.query(
    `SELECT PK_ROL, NOMBRE, DESCRIPCION FROM ${TABLE} WHERE PK_ROL = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    string,
  ] = rows[0];
  return new Rol(...result);
};

export const createNew = async (
  nombre: string,
  descripcion: string,
) => {
  await postgres.query(
    `INSERT INTO ${TABLE} (NOMBRE, DESCRIPCION) VALUES ($1, $2)`,
    nombre,
    descripcion,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public description: string,
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

  const query =
    `SELECT * FROM (SELECT PK_ROL AS ID, NOMBRE AS NAME, DESCRIPCION AS DESCRIPTION FROM ${TABLE}) AS TOTAL` +
    " " +
    `WHERE UNACCENT(NAME) ILIKE '%${search}%'` +
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
  ]) => new TableData(...x));

  return models;
};
