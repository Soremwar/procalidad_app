import postgres from "../../services/postgres.js";
import type { PostgresError } from "deno_postgres";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "ORGANIZACION.CARGO";

const ERROR_DEPENDENCY =
  "No se puede eliminar el area por que hay componentes que dependen de el";

class Cargo {
  constructor(
    public readonly pk_cargo: number,
    public nombre: string,
    public descripcion: string,
    public nombre_publico: string,
  ) {}

  async update(
    nombre = this.nombre,
    descripcion = this.descripcion,
    nombre_publico = this.nombre_publico,
  ): Promise<
    Cargo
  > {
    Object.assign(this, {
      nombre,
      descripcion,
      nombre_publico,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3,
        NOMBRE_PUBLICO = $4
      WHERE PK_CARGO = $1`,
      this.pk_cargo,
      this.nombre,
      this.descripcion,
      this.nombre_publico,
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
    `SELECT
      PK_CARGO,
      NOMBRE,
      DESCRIPCION,
      NOMBRE_PUBLICO
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
    string,
    string,
  ]) => new Cargo(...row));
};

export const findById = async (id: number): Promise<Cargo | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CARGO,
      NOMBRE,
      DESCRIPCION,
      NOMBRE_PUBLICO
    FROM ${TABLE}
    WHERE PK_CARGO = $1`,
    id,
  );

  if (!rows[0]) return null;

  return new Cargo(
    ...rows[0] as [
      number,
      string,
      string,
      string,
    ],
  );
};

export const createNew = async (
  nombre: string,
  descripcion: string,
  nombre_publico: string,
): Promise<Cargo> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION,
      NOMBRE_PUBLICO
    ) VALUES (
      $1,
      $2,
      $3
    ) RETURNING PK_CARGO`,
    nombre,
    descripcion,
    nombre_publico,
  );

  const id: number = rows[0][0];

  return new Cargo(
    id,
    nombre,
    descripcion,
    nombre_publico,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public public_name: string,
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
      DESCRIPCION AS DESCRIPTION,
      NOMBRE_PUBLICO AS PUBLIC_NAME
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
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
