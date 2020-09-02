import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

const TABLE = "OPERACIONES.TIPO_PRESUPUESTO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el tipo de presupuesto por que hay componentes que dependen de el";

class TipoPresupuesto {
  constructor(
    public readonly pk_tipo: number,
    public nombre: string,
    public descripcion: string,
  ) {}

  async update(
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
  ): Promise<
    TipoPresupuesto
  > {
    Object.assign(this, { nombre, descripcion });
    await postgres.query(
      `UPDATE ${TABLE} SET NOMBRE = $2, DESCRIPCION = $3 WHERE PK_TIPO = $1`,
      this.pk_tipo,
      this.nombre,
      this.descripcion,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_TIPO = $1`,
      this.pk_tipo,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<TipoPresupuesto[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_TIPO, NOMBRE, DESCRIPCION FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
  ]) => new TipoPresupuesto(...row));

  return models;
};

export const findById = async (id: number): Promise<TipoPresupuesto | null> => {
  const { rows } = await postgres.query(
    `SELECT PK_TIPO, NOMBRE, DESCRIPCION FROM ${TABLE} WHERE PK_TIPO = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    string,
  ] = rows[0];
  return new TipoPresupuesto(...result);
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
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_TIPO AS ID,
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
