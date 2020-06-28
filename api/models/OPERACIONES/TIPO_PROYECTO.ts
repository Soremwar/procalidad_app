import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

export const TABLE = "OPERACIONES.TIPO_PROYECTO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el tipo de proyecto por que hay componentes que dependen de el";

class TipoProyecto {
  constructor(
    public readonly pk_tipo: number,
    public nombre: string,
    public ban_facturable: boolean,
  ) {}

  async update(
    nombre: string = this.nombre,
    ban_facturable = this.ban_facturable,
  ): Promise<
    TipoProyecto
  > {
    Object.assign(this, { nombre, ban_facturable });
    await postgres.query(
      `UPDATE ${TABLE} SET NOMBRE = $2, BAN_FACTURABLE = $3 WHERE PK_TIPO = $1`,
      this.pk_tipo,
      this.nombre,
      this.ban_facturable,
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

export const findAll = async (): Promise<TipoProyecto[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_TIPO, NOMBRE, BAN_FACTURABLE FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    boolean,
  ]) => new TipoProyecto(...row));

  return models;
};

export const findById = async (id: number): Promise<TipoProyecto | null> => {
  const { rows } = await postgres.query(
    `SELECT PK_TIPO, NOMBRE, BAN_FACTURABLE FROM ${TABLE} WHERE PK_TIPO = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    boolean,
  ] = rows[0];
  return new TipoProyecto(...result);
};

export const createNew = async (
  nombre: string,
  ban_facturable: boolean,
) => {
  await postgres.query(
    `INSERT INTO ${TABLE} (NOMBRE, BAN_FACTURABLE) VALUES ($1, $2)`,
    nombre,
    ban_facturable,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public billable: string,
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
        PK_TIPO AS ID,
        NOMBRE AS NAME,
        CASE WHEN BAN_FACTURABLE = TRUE THEN 'Facturable' ELSE 'No Facturable' END AS BILLABLE
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
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
