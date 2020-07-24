import postgres from "../../services/postgres.js";
import {
  TABLE as PERSON_TABLE,
} from "../ORGANIZACION/PERSONA.ts";
import {
  TABLE as BUDGET_TABLE,
} from "./budget.ts";
import {
  TABLE as ROLE_TABLE,
} from "./ROL.ts";
import {
  TABLE as PROJECT_TABLE,
} from "./PROYECTO.ts";
import {
  TABLE as CONTROL_TABLE,
} from "./control_semana.ts";

export const TABLE = "OPERACIONES.ASIGNACION_SOLICITUD";

class AssignationRequest {
  constructor(
    public readonly id: number,
    public readonly control: number,
    public readonly budget: number,
    public readonly role: number,
    public readonly date: number,
    public readonly hours: number,
    public readonly description: string,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_SOLICITUD = $1`,
      this.id,
    );
  }
}

export const createNew = async (
  control: number,
  budget: number,
  role: number,
  date: number,
  horas: number,
  description: string,
): Promise<AssignationRequest> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_CONTROL_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS,
      DESCRIPCION
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    ) RETURNING PK_SOLICITUD`,
    control,
    budget,
    role,
    date,
    horas,
    description,
  );

  const id: number = rows[0][0];

  return new AssignationRequest(
    id,
    control,
    budget,
    role,
    date,
    horas,
    description,
  );
};

export const findById = async (id: number): Promise<AssignationRequest> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SOLICITUD,
      FK_CONTROL_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS,
      DESCRIPCION
    FROM
      ${TABLE}
    WHERE PK_SOLICITUD = $1`,
    id,
  );

  const result: [
    number,
    number,
    number,
    number,
    number,
    number,
    string,
  ] = rows[0];

  return new AssignationRequest(...result);
};

export const deleteByWeekControl = async (control: number): Promise<void> => {
  await postgres.query(
    `DELETE FROM ${TABLE} WHERE FK_CONTROL_SEMANA = $1`,
    control,
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly id_week: number,
    public readonly person: string,
    public readonly id_project: number,
    public readonly project: string,
    public readonly role: string,
    public readonly date: string,
    public readonly hours: number,
    public readonly description: string,
  ) {
  }
}

export const getTableData = async () => {
  const { rows } = await postgres.query(
    `SELECT
      A.PK_SOLICITUD AS ID,
      C.FK_SEMANA AS ID_WEEK,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = C.FK_PERSONA) AS PERSON,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = A.FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PROJECT_TABLE} WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = A.FK_PRESUPUESTO)) AS PROJECT,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = A.FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      TO_CHAR(HORAS, 'FM999999999.0') AS HOURS,
      DESCRIPCION AS DESCRIPTION
    FROM ${TABLE} AS A
    JOIN ${CONTROL_TABLE} AS C
      ON A.FK_CONTROL_SEMANA = C.PK_CONTROL`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    string,
    string,
    string,
    number,
    string,
  ]) => new TableData(...row));
};
