import postgres from "../../services/postgres.js";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

import {
  TABLE as BUDGET_TABLE,
} from "../OPERACIONES/PRESUPUESTO.ts";
import {
  TABLE as ROLE_TABLE,
} from "../OPERACIONES/ROL.ts";
import {
  TABLE as PERSON_TABLE,
} from "../ORGANIZACION/PERSONA.ts";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";

export const TABLE = "ASIGNACION.ASIGNACION";

class Asignacion {
  constructor(
    public readonly id: number,
    public person: number,
    public budget: number,
    public role: number,
    public date: number,
    public hours: number,
  ) {}

  async update(
    person: number = this.person,
    budget: number = this.budget,
    role: number = this.role,
    date: number = this.date,
    hours: number = this.hours,
  ): Promise<
    Asignacion
  > {
    Object.assign(this, {
      person,
      budget,
      role,
      date,
      hours,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
          FK_PERSONA = $2,
          FK_PRESUPUESTO = $3,
          FK_ROL = $4,
          FECHA = $5,
          HORAS = $6
        WHERE PK_ASIGNACION = $1`,
      this.id,
      this.person,
      this.budget,
      this.role,
      this.date,
      this.hours,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_ASIGNACION = $1`,
      this.id,
    );
  }
}

export const findAll = async (): Promise<Asignacion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    number,
    number,
    number,
  ]) => new Asignacion(...row));
};

export const findById = async (id: number): Promise<Asignacion | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS
    FROM ${TABLE}
    WHERE PK_ASIGNACION = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    number,
    number,
    number,
  ] = rows[0];

  return new Asignacion(...result);
};

export const createNew = async (
  person: number,
  budget: number,
  role: number,
  date: number,
  hours: number,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    ) RETURNING PK_ASIGNACION`,
    person,
    budget,
    role,
    date,
    hours,
  );

  const id: number = rows[0][0];

  return new Asignacion(
    id,
    person,
    budget,
    role,
    date,
    hours,
  );
};

class TableData {
  constructor(
    public id: number,
    public id_project: number,
    public person: string,
    public role: string,
    public date: string,
    public week_code: string,
    public hours: number,
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
      PK_ASIGNACION AS ID,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(CAST(FECHA AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      (SELECT COD_SEMANA FROM ${WEEK_TABLE} WHERE TO_DATE(CAST(FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN FECHA_INICIO AND FECHA_FIN) AS WEEK_CODE,
      HORAS AS HOURS
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
    number,
    string,
    string,
    string,
    string,
    number,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
