import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const ERROR_CONSTRAINT =
  "El supervisor ingresado para el tipo de area no existe";
const ERROR_DEPENDENCY =
  "No se puede eliminar el cliente por que hay componentes que dependen de el";

class TipoArea {
  constructor(
    public readonly pk_tipo: number,
    public nombre: string,
    public fk_supervisor: number,
  ) {}

  async update(
    nombre: string = this.nombre,
    fk_supervisor: number = this.fk_supervisor,
  ): Promise<
    TipoArea
  > {
    Object.assign(this, { nombre, fk_supervisor });
    await postgres.query(
      "UPDATE ORGANIZACION.TIPO_AREA SET NOMBRE = $2, FK_SUPERVISOR = $3 WHERE PK_TIPO = $1",
      this.pk_tipo,
      this.nombre,
      this.fk_supervisor,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_CONSTRAINT;
      }

      throw e;
    });

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM ORGANIZACION.TIPO_AREA WHERE PK_TIPO = $1",
      this.pk_tipo,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<TipoArea[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_TIPO, NOMBRE, FK_SUPERVISOR FROM ORGANIZACION.TIPO_AREA",
  );

  const models = rows.map((row: [
    number,
    string,
    number,
  ]) => new TipoArea(...row));

  return models;
};

export const findById = async (id: number): Promise<TipoArea | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_TIPO, NOMBRE, FK_SUPERVISOR FROM ORGANIZACION.TIPO_AREA WHERE PK_TIPO = $1",
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    number,
  ] = rows[0];
  return new TipoArea(...result);
};

export const createNew = async (nombre: string, fk_supervisor: number) => {
  await postgres.query(
    "INSERT INTO ORGANIZACION.TIPO_AREA (NOMBRE, FK_SUPERVISOR) VALUES ($1, $2)",
    nombre,
    fk_supervisor,
  ).catch((e: PostgresError) => {
    if (e.fields.constraint) {
      e.message = ERROR_CONSTRAINT;
    }

    throw e;
  });
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public supervisor: string,
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
    "SELECT * FROM (SELECT PK_TIPO AS ID, NOMBRE AS NAME, (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_SUPERVISOR) AS SUPERVISOR FROM ORGANIZACION.TIPO_AREA) AS TOTAL" +
    " " +
    `WHERE UNACCENT(NAME) ILIKE '%${search}%' OR UNACCENT(SUPERVISOR) ILIKE '%${search}%'` +
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
