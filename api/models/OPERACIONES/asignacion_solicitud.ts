import postgres from "../../services/postgres.js";
import { Profiles } from "../../common/profiles.ts";
import { TABLE as ACCESS_TABLE } from "../MAESTRO/access.ts";
import { TABLE as PERSON_TABLE } from "../ORGANIZACION/people.ts";
import { TABLE as SUB_AREA_TABLE } from "../ORGANIZACION/sub_area.ts";
import { TABLE as BUDGET_TABLE } from "./budget.ts";
import { TABLE as ROLE_TABLE } from "./ROL.ts";
import { TABLE as PROJECT_TABLE } from "./PROYECTO.ts";
import { TABLE as WEEK_TABLE } from "../MAESTRO/dim_semana.ts";

export const TABLE = "OPERACIONES.ASIGNACION_SOLICITUD";

class AssignationRequest {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly budget: number,
    public readonly role: number,
    public readonly date: number,
    public readonly hours: number,
    public readonly description: string,
    public readonly request_date: Date,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_SOLICITUD = $1`,
      this.id,
    );
  }
}

export const createNew = async (
  person: number,
  budget: number,
  role: number,
  date: number,
  horas: number,
  description: string,
): Promise<AssignationRequest> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS,
      DESCRIPCION,
      FEC_SOLICITUD
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      NOW()
    ) RETURNING
      PK_SOLICITUD,
      FEC_SOLICITUD`,
    person,
    budget,
    role,
    date,
    horas,
    description,
  );

  const id: number = rows[0][0];
  const request_date = new Date(rows[0][1]);

  return new AssignationRequest(
    id,
    person,
    budget,
    role,
    date,
    horas,
    description,
    request_date,
  );
};

export const findById = async (
  id: number,
): Promise<AssignationRequest | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SOLICITUD,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS,
      DESCRIPCION,
      FEC_SOLICITUD
    FROM
      ${TABLE}
    WHERE PK_SOLICITUD = $1`,
    id,
  );

  if (!rows.length) {
    return null;
  }

  return new AssignationRequest(
    ...rows[0] as [
      number,
      number,
      number,
      number,
      number,
      number,
      string,
      Date,
    ],
  );
};

export const findByPersonAndWeek = async (
  person: number,
  week: number,
): Promise<AssignationRequest[]> => {
  const { rows } = await postgres.query(
    `SELECT
      A.PK_SOLICITUD,
      A.FK_PERSONA,
      A.FK_PRESUPUESTO,
      A.FK_ROL,
      A.FECHA,
      A.HORAS,
      A.DESCRIPCION,
      A.FEC_SOLICITUD
    FROM
      ${TABLE} A
    JOIN MAESTRO.DIM_SEMANA S
      ON TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD') BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
    WHERE A.FK_PERSONA = $1
    AND S.PK_SEMANA = $2`,
    person,
    week,
  );

  return rows.map((row: [
    number,
    number,
    number,
    number,
    number,
    number,
    string,
    Date,
  ]) => new AssignationRequest(...row));
};

export const getPersonRequestedHoursByWeek = async (
  person: number,
  week: number,
) => {
  const { rows } = await postgres.query(
    `SELECT
      SUM(A.HORAS)
    FROM ${TABLE} A 
    JOIN ${WEEK_TABLE} DS
      ON TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD') BETWEEN DS.FECHA_INICIO AND DS.FECHA_FIN
    WHERE A.FK_PERSONA = $1
    AND DS.PK_SEMANA = $2`,
    person,
    week,
  );

  return Number(rows[0]?.[0]) || 0;
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly id_week: number,
    public readonly person: string,
    public readonly id_client: number,
    public readonly id_project: number,
    public readonly project: string,
    public readonly role: string,
    public readonly supervisor: string,
    public readonly hours: number,
    public readonly description: string,
  ) {
  }
}

export const getTableData = async (person: number) => {
  const { rows } = await postgres.query(
    `WITH ADMIN_USERS AS (
      SELECT FK_PERSONA AS USERS
      FROM ${ACCESS_TABLE} WHERE FK_PERMISO IN (
        ${Profiles.ADMINISTRATOR},
        ${Profiles.CONTROLLER}
      )
    )
    SELECT
      A.PK_SOLICITUD AS ID,
      S.PK_SEMANA AS ID_WEEK,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = A.FK_PERSONA) AS PERSON,
      P.FK_CLIENTE AS ID_CLIENT,
      P.PK_PROYECTO AS ID_PROJECT,
      P.NOMBRE AS PROJECT,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = A.FK_ROL) AS ROLE,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = P.FK_SUPERVISOR) AS SUPERVISOR,
      TO_CHAR(A.HORAS, 'FM999999999.0') AS HOURS,
      A.DESCRIPCION AS DESCRIPTION
    FROM ${TABLE} AS A
    JOIN ${WEEK_TABLE} AS S
      ON TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD') BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
    JOIN ${BUDGET_TABLE} AS B
      ON A.FK_PRESUPUESTO = B.PK_PRESUPUESTO
    JOIN ${PROJECT_TABLE} AS P
      ON B.FK_PROYECTO = P.PK_PROYECTO
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
    WHERE ALLOWED_USERS.SUPERVISOR = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    number,
    string,
    string,
    string,
    number,
    string,
  ]) => new TableData(...row));
};
