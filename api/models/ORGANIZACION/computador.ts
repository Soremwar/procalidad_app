import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const TABLE = "ORGANIZACION.COMPUTADOR";
const ERROR_DEPENDENCY =
  "No se puede eliminar el area por que hay componentes que dependen de el";

class Computador {
  constructor(
    public readonly pk_computador: number,
    public nombre: string,
    public descripcion: string,
    public costo: number,
  ) {}

  async update(
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
    costo: number = this.costo,
  ): Promise<
    Computador
  > {
    Object.assign(this, { nombre, descripcion, costo });
    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3,
        COSTO = $4
      WHERE PK_COMPUTADOR = $1`,
      this.pk_computador,
      this.nombre,
      this.descripcion,
      this.costo,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_COMPUTADOR = $1`,
      this.pk_computador,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Computador[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_COMPUTADOR, NOMBRE, DESCRIPCION, COSTO FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
    number,
  ]) => new Computador(...row));

  return models;
};

export const findById = async (id: number): Promise<Computador | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_COMPUTADOR,
      NOMBRE,
      DESCRIPCION,
      COSTO
    FROM ${TABLE}
    WHERE PK_COMPUTADOR = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    string,
    number,
  ] = rows[0];
  return new Computador(...result);
};

export const createNew = async (
  nombre: string,
  descripcion: string,
  costo: number,
): Promise<Computador> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION,
      COSTO
    ) VALUES ($1, $2, $3)
    RETURNING PK_COMPUTADOR`,
    nombre,
    descripcion,
    costo,
  );

  const id: number = rows[0][0];

  return new Computador(id, nombre, descripcion, costo);
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public cost: number,
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

  const query = `SELECT * FROM (SELECT
      PK_COMPUTADOR AS ID,
      NOMBRE AS NAME,
      DESCRIPCION AS DESCRIPTION,
      COSTO AS COST
    FROM ${TABLE}) AS TOTAL
    WHERE
      UNACCENT(NAME) ILIKE '%${search}%' OR
      UNACCENT(DESCRIPTION) ILIKE '%${search}%'` +
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
    number,
  ]) => new TableData(...x));

  return models;
};
