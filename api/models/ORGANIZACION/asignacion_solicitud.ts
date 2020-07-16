import postgres from "../../services/postgres.js";
import {
  TABLE as PERSON_TABLE,
} from "./PERSONA.ts";
import {
  TABLE as BUDGET_TABLE,
} from "../OPERACIONES/PRESUPUESTO.ts";
import {
  TABLE as ROLE_TABLE,
} from "../OPERACIONES/ROL.ts";

export const TABLE = "ORGANIZACION.ASIGNACION_SOLICITUD";

class AssignationRequest {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly budget: number,
    public readonly role: number,
    public readonly date: Date,
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
  person: number,
  budget: number,
  role: number,
  date: Date,
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
      DESCRIPCION
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    ) RETURNING PK_SOLICITUD`,
    person,
    budget,
    role,
    date,
    horas,
    description,
  );

  const id: number = rows[0][0];

  return new AssignationRequest(
    id,
    person,
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
      FK_PERSONA,
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
    Date,
    number,
    string,
  ] = rows[0];

  return new AssignationRequest(...result);
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly person: string,
    public readonly budget: string,
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
      PK_SOLICITUD AS ID,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) AS BUDGET,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = FK_ROL) AS ROLE,
      TO_CHAR(FECHA, 'YYYY-MM-DD') AS DATE,
      HORAS AS HOURS,
      DESCRIPCION AS DESCRIPTION
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
    string,
    string,
    string,
    number,
    string,
  ]) => new TableData(...row));
};
