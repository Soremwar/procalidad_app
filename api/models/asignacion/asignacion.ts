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
import {
  TABLE as CONTROL_TABLE,
} from "../ORGANIZACION/control_cierre_semana.ts";

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

export const getAvailableWeeks = async (): Promise<number[]> => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(S.FECHA_INICIO, 'YYYYMMDD') AS WEEK_DATE
    FROM ${TABLE} AS A
    JOIN ${WEEK_TABLE} AS S
    ON TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD') BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
    JOIN ${CONTROL_TABLE} AS C
    ON S.PK_SEMANA = C.FK_SEMANA
    WHERE C.BAN_ESTADO = false
    group by 
    TO_CHAR(S.FECHA_INICIO, 'YYYYMMDD')`,
  );

  return rows.map(([x]: [number]) => x);
};

class TableData {
  constructor(
    public id: number,
    public id_project: number,
    public person: string,
    public role: string,
    public date: string,
    public week_date: number,
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
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = A.FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = A.FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = A.FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      TO_CHAR(S.FECHA_INICIO, 'YYYYMMDD') AS WEEK_DATE,
      HORAS AS HOURS
    FROM ${TABLE} AS A
    JOIN ${WEEK_TABLE} AS S
    ON TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD') BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
    JOIN ${CONTROL_TABLE} AS C
    ON S.PK_SEMANA = C.FK_SEMANA
    WHERE C.BAN_ESTADO = FALSE`
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
    number,
    number,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
