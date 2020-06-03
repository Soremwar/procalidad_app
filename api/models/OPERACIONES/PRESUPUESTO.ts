import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const TABLE = "OPERACIONES.PRESUPUESTO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el presupuesto por que hay componentes que dependen de el";

class Presupuesto {
  constructor(
    public readonly pk_presupuesto: number,
    public fk_cliente: number | undefined,
    public fk_proyecto: number,
    public fk_tipo_presupuesto: number,
    public nombre: string,
    public descripcion: string,
    public estado: boolean,
  ) {}

  async update(
    fk_proyecto: number = this.fk_proyecto,
    fk_tipo_presupuesto: number = this.fk_tipo_presupuesto,
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
    estado: boolean = this.estado,
  ): Promise<
    Presupuesto
  > {
    Object.assign(this, {
      fk_proyecto,
      fk_tipo_presupuesto,
      nombre,
      descripcion,
      estado,
    });
    await postgres.query(
      `UPDATE ${TABLE}
      SET
        FK_PROYECTO = $2,
        FK_TIPO_PRESUPUESTO = $3,
        NOMBRE = $4,
        DESCRIPCION = $5,
        ESTADO = $6
      WHERE PK_PRESUPUESTO = $1`,
      this.pk_presupuesto,
      this.fk_proyecto,
      this.fk_tipo_presupuesto,
      this.nombre,
      this.descripcion,
      this.estado,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PRESUPUESTO = $1`,
      this.pk_presupuesto,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Presupuesto[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PRESUPUESTO,
      NULL,
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    undefined,
    number,
    number,
    string,
    string,
    boolean,
  ]) => new Presupuesto(...row));

  return models;
};

export const findById = async (id: number): Promise<Presupuesto | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PRESUPUESTO,
      (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = FK_PROYECTO) AS FK_CLIENTE,
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}
    WHERE PK_PRESUPUESTO = $1`,
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
    boolean,
  ] = rows[0];
  return new Presupuesto(...result);
};

export const createNew = async (
  fk_proyecto: number,
  fk_tipo_presupuesto: number,
  nombre: string,
  descripcion: string,
  estado: boolean,
): Promise<number> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING PK_PRESUPUESTO`,
    fk_proyecto,
    fk_tipo_presupuesto,
    nombre,
    descripcion,
    estado,
  );

  //Returns created id
  return rows[0][0];
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public project: string,
    public budget_type: string,
    public status: string,
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
      PK_PRESUPUESTO AS ID,
      NOMBRE AS NAME,
      (SELECT NOMBRE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = FK_PROYECTO) AS PROJECT,
      (SELECT NOMBRE FROM OPERACIONES.TIPO_PRESUPUESTO WHERE PK_TIPO = FK_TIPO_PRESUPUESTO) AS BUDGET_TYPE,
      CASE WHEN ESTADO = TRUE THEN 'Abierto' ELSE 'Cerrado' END AS STATUS
    FROM ${TABLE}
  ) AS TOTAL` +
    " " +
    `WHERE UNACCENT(NAME) ILIKE '%${search}%' OR UNACCENT(PROJECT) ILIKE '%${search}%'` +
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
