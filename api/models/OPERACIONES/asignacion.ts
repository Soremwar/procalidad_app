import postgres from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { Profiles } from "../../common/profiles.ts";
import { TABLE as BUDGET_TABLE } from "./budget.ts";
import { TABLE as PROJECT_TABLE } from "./PROYECTO.ts";
import { TABLE as ROLE_TABLE } from "./ROL.ts";
import { TABLE as PERSON_TABLE } from "../ORGANIZACION/people.ts";
import { TABLE as POSITION_ASSIGNATION_TABLE } from "../ORGANIZACION/asignacion_cargo.ts";
import { TABLE as SUB_AREA_TABLE } from "../ORGANIZACION/sub_area.ts";
import { TABLE as AREA_TABLE } from "../ORGANIZACION/AREA.ts";
import { TABLE as AREA_TYPE_TABLE } from "../ORGANIZACION/area_type.ts";
import { TABLE as WEEK_TABLE, Week } from "../MAESTRO/dim_semana.ts";
import { TABLE as ACCESS_TABLE } from "../MAESTRO/access.ts";
import {
  findByPersonAndWeek as findControl,
  TABLE as CONTROL_TABLE,
} from "./control_semana.ts";

export const TABLE = "OPERACIONES.ASIGNACION";

class Asignacion {
  constructor(
    public readonly id: number,
    public person: number,
    public budget: number,
    public role: number,
    public week: number,
    public date: number,
    public hours: number,
  ) {}

  async delete(): Promise<void> {
    const control = await findControl(this.person, this.week);
    if (control?.closed) {
      throw new Error(
        "La semana asociada a esta asignacion se encuentra cerrada",
      );
    }

    if (control) {
      await control.clearRegistry(this.budget, this.role);
    }

    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_ASIGNACION = $1`,
      this.id,
    );
  }

  /*
  * Updates only the hours for each assignation
  * */
  async update(
    hours: number = this.hours,
  ): Promise<
    Asignacion
  > {
    Object.assign(this, {
      hours,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
          HORAS = $2
        WHERE PK_ASIGNACION = $1`,
      this.id,
      this.hours,
    );

    return this;
  }
}

export const createNew = async (
  person: number,
  budget: number,
  role: number,
  week: number,
  date: number,
  hours: number,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} AS A (
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FK_SEMANA,
      FECHA,
      HORAS
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    ) ON CONFLICT (FK_PRESUPUESTO, FK_PERSONA, FK_ROL, FECHA) DO
    UPDATE SET HORAS = $6 + A.HORAS
    RETURNING PK_ASIGNACION, HORAS`,
    person,
    budget,
    role,
    week,
    date,
    hours,
  );

  const [id, final_hours]: [number, number] = rows[0];

  return new Asignacion(
    id,
    person,
    budget,
    role,
    week,
    date,
    final_hours,
  );
};

export const findAll = async (): Promise<Asignacion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FK_SEMANA,
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
      FK_SEMANA,
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
    number,
  ] = rows[0];

  return new Asignacion(...result);
};

// This query is executed this way so it returns all assignation
// that doesn't have a matching control week as well
export const findOpenByBudget = async (
  budget: number,
): Promise<Asignacion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FK_SEMANA,
      FECHA,
      HORAS
    FROM ${TABLE}
    WHERE FK_PRESUPUESTO = $1
    AND PK_ASIGNACION NOT IN (
      SELECT
        A.PK_ASIGNACION
      FROM ${TABLE} A
      JOIN ${CONTROL_TABLE} CS
        ON A.FK_PERSONA = CS.FK_PERSONA 
        AND A.FK_SEMANA = CS.FK_SEMANA
        AND CS.BAN_CERRADO = TRUE
      WHERE A.FK_PRESUPUESTO = $1
    )`,
    budget,
  );

  return rows.map((row) =>
    new Asignacion(
      ...row as [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ],
    )
  );
};

/*
* Returns the week code and start date of the weeks available for assignation
* */
export const getAvailableWeeks = async (): Promise<Week[]> => {
  const { rows } = await postgres.query(
    `WITH SEMANAS AS (
      SELECT
        COALESCE(
          MIN(TO_CHAR(S.FECHA_INICIO, 'YYYYMMDD')::INTEGER),
          (SELECT MIN(FECHA) FROM ${TABLE})
        ) AS MIN,
        COALESCE(
          MAX(TO_CHAR(S.FECHA_INICIO, 'YYYYMMDD')::INTEGER),
          (SELECT MAX(FECHA) FROM ${TABLE})
        ) AS MAX
      FROM ${CONTROL_TABLE} C
      JOIN ${WEEK_TABLE} S
      	ON C.FK_SEMANA = S.PK_SEMANA
      JOIN ${POSITION_ASSIGNATION_TABLE} PA
      	ON PA.FK_PERSONA = C.FK_PERSONA
      JOIN ${SUB_AREA_TABLE} SA
      	ON SA.PK_SUB_AREA = PA.FK_SUB_AREA
      JOIN ${AREA_TABLE} A
      	ON A.PK_AREA = SA.FK_AREA
      JOIN ${AREA_TYPE_TABLE} TA
      	ON TA.PK_TIPO = A.FK_TIPO_AREA
      WHERE C.BAN_CERRADO = FALSE
      AND TA.BAN_REGISTRABLE = TRUE
    )
    SELECT
      PK_SEMANA AS ID,
      COD_SEMANA AS CODE,
      FECHA_INICIO AS START_DATE,
      FECHA_FIN AS END_DATE
    FROM ${WEEK_TABLE}
    WHERE TO_CHAR(FECHA_INICIO, 'YYYYMMDD')::INTEGER
      BETWEEN (SELECT MIN FROM SEMANAS)
      AND (SELECT MAX FROM SEMANAS)
    ORDER BY
      CODE`,
  );

  return rows.map(([
    id,
    code,
    start_date,
    end_date,
  ]: [
    number,
    string,
    Date,
    Date,
  ]) =>
    new Week(
      id,
      code,
      new Date(start_date),
      new Date(end_date),
    )
  );
};

export const getAssignationHoursByWeek = async (
  person: number,
  week: number,
): Promise<number> => {
  const { rows } = await postgres.query(
    `SELECT
      COALESCE(
        SUM(HORAS),
        0
      )
    FROM ${TABLE}
    WHERE FK_PERSONA = $1
    AND FK_SEMANA = $2
    GROUP BY
      FK_PERSONA,
      FK_SEMANA`,
    person,
    week,
  );

  return Number(rows[0]?.[0]) || 0;
};

class TableData {
  constructor(
    public id: number,
    public id_week: number,
    public id_client: number,
    public id_project: number,
    public person: string,
    public role: string,
    public date: string,
    public hours: number,
    public editable: string,
    public id_supervisor: number,
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
    `WITH ADMIN_USERS AS (
      SELECT FK_PERSONA AS USERS
      FROM ${ACCESS_TABLE} WHERE FK_PERMISO IN (
        ${Profiles.ADMINISTRATOR},
        ${Profiles.CONTROLLER}
      )
    )
    SELECT
      PK_ASIGNACION AS ID,
      S.PK_SEMANA AS ID_WEEK,
      (SELECT FK_CLIENTE FROM ${PROJECT_TABLE} WHERE PK_PROYECTO = B.FK_PROYECTO) AS ID_CLIENT,
      B.FK_PROYECTO AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = A.FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = A.FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      TO_CHAR(HORAS, 'FM999999999.0') AS HOURS,
      CASE WHEN C.BAN_CERRADO IS NULL THEN 'No modificable' ELSE 'Modificable' END AS EDITABLE,
      ALLOWED_USERS.SUPERVISOR AS ID_SUPERVISOR
    FROM ${TABLE} AS A
    JOIN ${WEEK_TABLE} AS S
      ON A.FK_SEMANA = S.PK_SEMANA
    JOIN ${BUDGET_TABLE} AS B
      ON A.FK_PRESUPUESTO = B.PK_PRESUPUESTO
    JOIN (
      SELECT
        PRE.PK_PRESUPUESTO,
        UNNEST(ARRAY_CAT(
          ARRAY[PRO.FK_SUPERVISOR, SA.FK_SUPERVISOR],
          (SELECT ARRAY_AGG(USERS) FROM ADMIN_USERS)
        )) AS SUPERVISOR
      FROM ${BUDGET_TABLE} PRE
      JOIN ${PROJECT_TABLE} PRO
        ON PRO.PK_PROYECTO = PRE.FK_PROYECTO
      JOIN ${SUB_AREA_TABLE} SA
        ON SA.PK_SUB_AREA = PRO.FK_SUB_AREA
      GROUP BY PK_PRESUPUESTO, SUPERVISOR
    ) ALLOWED_USERS
    ON ALLOWED_USERS.PK_PRESUPUESTO = A.FK_PRESUPUESTO
    LEFT JOIN ${CONTROL_TABLE} AS C
      ON A.FK_SEMANA = C.FK_SEMANA
      AND A.FK_PERSONA = C.FK_PERSONA
      AND C.BAN_CERRADO = FALSE`
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
    number,
    number,
    number,
    string,
    string,
    string,
    number,
    string,
    number,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
