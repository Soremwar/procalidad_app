import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const TABLE = "OPERACIONES.PROYECTO";

const ERROR_DEPENDENCY =
  "No se puede eliminar el cliente por que hay componentes que dependen de el";

class Proyecto {
  constructor(
    public readonly pk_proyecto: number,
    public fk_tipo_proyecto: number,
    public fk_cliente: number,
    public fk_area: number,
    public nombre: string,
    public descripcion: string,
    public estado: number,
  ) { }

  async update(
    fk_tipo_proyecto: number = this.fk_tipo_proyecto,
    fk_cliente: number = this.fk_cliente,
    fk_area: number = this.fk_area,
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
    estado: number = this.estado,
  ): Promise<
    Proyecto
  > {
    Object.assign(this, {
      fk_tipo_proyecto,
      fk_cliente,
      fk_area,
      nombre,
      descripcion,
      estado,
    });
    await postgres.query(
      `UPDATE ${TABLE} SET FK_TIPO_PROYECTO = $2, FK_CLIENTE = $3, FK_AREA = $4, NOMBRE = $5, DESCRIPCION = $6, ESTADO = $7 WHERE PK_PROYECTO = $1`,
      this.pk_proyecto,
      this.fk_tipo_proyecto,
      this.fk_cliente,
      this.fk_area,
      this.nombre,
      this.descripcion,
      this.estado,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PROYECTO = $1`,
      this.pk_proyecto,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Proyecto[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_PROYECTO, FK_TIPO_PROYECTO, FK_CLIENTE, FK_AREA, NOMBRE, DESCRIPCION, ESTADO FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    number,
    number,
    number,
    string,
    string,
    number,
  ]) => new Proyecto(...row));

  return models;
};

export const findById = async (id: number): Promise<Proyecto | null> => {
  const { rows } = await postgres.query(
    `SELECT PK_PROYECTO, FK_TIPO_PROYECTO, FK_CLIENTE, FK_AREA, NOMBRE, DESCRIPCION, ESTADO FROM ${TABLE} WHERE PK_PROYECTO = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    number,
    number,
    number,
    string,
    string,
    number,
  ] = rows[0];
  return new Proyecto(...result);
};

export const createNew = async (
  fk_tipo_proyecto: number,
  fk_cliente: number,
  fk_area: number,
  nombre: string,
  descripcion: string,
  estado: number,
) => {
  await postgres.query(
    `INSERT INTO ${TABLE} (FK_TIPO_PROYECTO, FK_CLIENTE, FK_AREA, NOMBRE, DESCRIPCION, ESTADO) VALUES ($1, $2, $3, $4, $5, $6)`,
    fk_tipo_proyecto,
    fk_cliente,
    fk_area,
    nombre,
    descripcion,
    estado,
  );
};

class TableData {
  constructor(
    public id: number,
    public type: string,
    public client: string,
    public area: string,
    public name: string,
  ) { }
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
    `SELECT * FROM (
      SELECT PK_PROYECTO AS ID,
      (SELECT NOMBRE FROM OPERACIONES.TIPO_PROYECTO WHERE PK_PROYECTO = FK_TIPO_PROYECTO) AS TYPE,
      (SELECT NOMBRE FROM CLIENTES.CLIENTE WHERE PK_CLIENTE = FK_CLIENTE) AS CLIENT,
      (SELECT NOMBRE FROM ORGANIZACION.AREA WHERE PK_AREA = FK_AREA) AS AREA,
      NOMBRE AS NAME
    FROM OPERACIONES.PROYECTO) AS TOTAL` +
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
    string,
    string,
  ]) => new TableData(...x));

  return models;
};
