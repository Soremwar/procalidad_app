import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

export const TABLE = "ORGANIZACION.CARGO";

const ERROR_DEPENDENCY =
  "No se puede eliminar el area por que hay componentes que dependen de el";

class Cargo {
  constructor(
    public readonly pk_cargo: number,
    public nombre: string,
    public descripcion: string,
  ) {}

  async update(
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
  ): Promise<
    Cargo
  > {
    Object.assign(this, { nombre, descripcion });
    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3
      WHERE PK_CARGO = $1`,
      this.pk_cargo,
      this.nombre,
      this.descripcion,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_CARGO = $1`,
      this.pk_cargo,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Cargo[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_CARGO, NOMBRE, DESCRIPCION FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
  ]) => new Cargo(...row));

  return models;
};

export const findById = async (id: number): Promise<Cargo | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CARGO,
      NOMBRE,
      DESCRIPCION
    FROM ${TABLE}
    WHERE PK_CARGO = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    string,
  ] = rows[0];
  return new Cargo(...result);
};

export const createNew = async (
  nombre: string,
  descripcion: string,
): Promise<Cargo> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE, DESCRIPCION
    ) VALUES ($1, $2)
    RETURNING PK_CARGO`,
    nombre,
    descripcion,
  );

  const id: number = rows[0][0];

  return new Cargo(id, nombre, descripcion);
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
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_CARGO AS ID,
      NOMBRE AS NAME,
      DESCRIPCION AS DESCRIPTION
    FROM ${TABLE}`
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
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
