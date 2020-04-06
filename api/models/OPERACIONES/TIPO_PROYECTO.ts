import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder
} from "../../common/table.ts";

const ERROR_DEPENDENCY =
  "No se puede eliminar el cliente por que hay componentes que dependen de el";

class TipoProyecto {
  constructor(
    public readonly pk_tipo: number,
    public nombre: string,
  ) {}

  async update(
    nombre: string = this.nombre,
  ): Promise<
    TipoProyecto
  > {
    Object.assign(this, { nombre });
    await postgres.query(
      "UPDATE OPERACIONES.TIPO_PROYECTO SET NOMBRE = $2 WHERE PK_TIPO = $1",
      this.pk_tipo,
      this.nombre,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM OPERACIONES.TIPO_PROYECTO WHERE PK_TIPO = $1",
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
    "SELECT PK_TIPO, NOMBRE FROM OPERACIONES.TIPO_PROYECTO",
  );

  const models = rows.map((row: [number, string]) => new TipoProyecto(...row));

  return models;
};

export const findById = async (id: number): Promise<TipoProyecto | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_TIPO, NOMBRE FROM OPERACIONES.TIPO_PROYECTO WHERE PK_TIPO = $1",
    id,
  );
  if (!rows[0]) return null;
  const result: [number, string] = rows[0];
  return new TipoProyecto(...result);
};

export const createNew = async (nombre: string) => {
  await postgres.query(
    "INSERT INTO OPERACIONES.TIPO_PROYECTO (NOMBRE) VALUES ($1)",
    nombre,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
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
    "SELECT * FROM (SELECT PK_TIPO AS ID, NOMBRE AS NAME FROM OPERACIONES.TIPO_PROYECTO) AS TOTAL" +
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
  ]) => new TableData(...x));

  return models;
};
