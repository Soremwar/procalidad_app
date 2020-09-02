import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
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

export const findByProject = async (project: number): Promise<Rol[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ROL,
      NOMBRE,
      DESCRIPCION
    FROM ${TABLE}
    WHERE PK_ROL IN (
      SELECT FK_ROL
      FROM OPERACIONES.PRESUPUESTO_DETALLE PD
      JOIN OPERACIONES.PRESUPUESTO P 
      ON PD.FK_PRESUPUESTO = P.PK_PRESUPUESTO
      WHERE P.FK_PROYECTO = $1
    )`,
    project,
  );

  return rows.map((result: [
    number,
    string,
    string,
  ]) => new Rol(...result));
};

export const createNew = async (
  nombre: string,
  descripcion: string,
): Promise<Rol> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION
    ) VALUES (
      $1,
      $2
    ) RETURNING PK_ROL`,
    nombre,
    descripcion,
  );

  const id: number = rows[0][0];

  return new Rol(
    id,
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
      PK_ROL AS ID,
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
