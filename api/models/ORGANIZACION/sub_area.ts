import postgres from "../../services/postgres.js";
import type{ PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

export const TABLE = "ORGANIZACION.SUB_AREA";

const ERROR_CONSTRAINT_DEFAULT =
  "Uno de los datos seleccionables ingresados para el subarea no existe";
const getConstraintError = (key: string) =>
  `El dato "${key}" ingresado para el area no existe`;
const ERROR_DEPENDENCY =
  "No se puede eliminar el subarea por que hay componentes que dependen de el";

class SubArea {
  constructor(
    public readonly pk_sub_area: number,
    public fk_area: number,
    public nombre: string,
    public fk_supervisor: number,
  ) {}

  async update(
    fk_area: number = this.fk_area,
    nombre: string = this.nombre,
    fk_supervisor: number = this.fk_supervisor,
  ): Promise<SubArea> {
    Object.assign(this, { fk_area, nombre, fk_supervisor });
    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_AREA = $2,
        NOMBRE = $3,
        FK_SUPERVISOR = $4
      WHERE PK_SUB_AREA = $1`,
      this.pk_sub_area,
      this.fk_area,
      this.nombre,
      this.fk_supervisor,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        if (e.fields.detail) {
          if (/persona/.test(e.fields.constraint)) {
            e.message = getConstraintError("supervisor");
          } else if (/area/.test(e.fields.detail)) {
            e.message = getConstraintError("area");
          } else {
            e.message = ERROR_CONSTRAINT_DEFAULT;
          }
        } else {
          e.message = ERROR_CONSTRAINT_DEFAULT;
        }
      }

      throw e;
    });

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_SUB_AREA = $1`,
      this.pk_sub_area,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<SubArea[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SUB_AREA,
      FK_AREA,
      NOMBRE,
      FK_SUPERVISOR
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    number,
    string,
    number,
  ]) => new SubArea(...row));

  return models;
};

export const findById = async (id: number): Promise<SubArea | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SUB_AREA,
      FK_AREA,
      NOMBRE,
      FK_SUPERVISOR
    FROM ${TABLE}
    WHERE PK_SUB_AREA = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    number,
    string,
    number,
  ] = rows[0];
  return new SubArea(...result);
};

export const createNew = async (
  fk_area: number,
  nombre: string,
  fk_supervisor: number,
): Promise<SubArea> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_AREA,
      NOMBRE,
      FK_SUPERVISOR
    ) VALUES ($1, $2, $3)
    RETURNING PK_SUB_AREA`,
    fk_area,
    nombre,
    fk_supervisor,
  );

  const id: number = rows[0][0];

  return new SubArea(id, fk_area, nombre, fk_supervisor);
};

class TableData {
  constructor(
    public id: number,
    public area: string,
    public name: string,
    public supervisor: string,
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
        PK_SUB_AREA AS ID,
        (SELECT NOMBRE FROM ORGANIZACION.AREA WHERE PK_AREA = FK_AREA) AS AREA,
        NOMBRE AS NAME,
        (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_SUPERVISOR) AS SUPERVISOR
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
