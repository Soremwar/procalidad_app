import postgres from "../../services/postgres.js";
import {
  TABLE as CONTROL_TABLE,
} from "./control_cierre_semana.ts";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";
import {
  TABLE as ASSIGNATION_TABLE,
} from "../asignacion/asignacion.ts";
import {
  TABLE as BUDGET_TABLE,
} from "../OPERACIONES/PRESUPUESTO.ts";
import {
  TABLE as ROLE_TABLE,
} from "../OPERACIONES/ROL.ts";
import {
  TABLE as PROJECT_TABLE,
} from "../OPERACIONES/PROYECTO.ts";
import {
  TABLE as CLIENT_TABLE,
} from "../CLIENTES/CLIENTE.ts";

export const TABLE = "ORGANIZACION.REGISTRO_DETALLE";

class WeekDetail {
  constructor(
    public readonly id: number,
    public readonly week: number,
    public readonly budget: number,
    public readonly role: number,
    public hours: number,
  ) {}

  async update(
    hours: number,
  ): Promise<WeekDetail> {
    Object.assign(this, {
      hours,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        HORAS = $2
      WHERE PK_REGISTRO = $1`,
      this.id,
      this.hours,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_REGISTRO = $1`,
      this.id,
    );
  }
}

export const createNew = async (
  week: number,
  budget: number,
  role: number,
  hours: number,
): Promise<WeekDetail> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_CIERRE_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    ) RETURNING PK_REGISTRO`,
    week,
    budget,
    role,
    hours,
  );

  const id: number = rows[0][0];

  return new WeekDetail(
    id,
    week,
    budget,
    role,
    hours,
  );
};

export const findById = async (id: number): Promise<WeekDetail | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_CIERRE_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS
    FROM ${TABLE}
    WHERE PK_REGISTRO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    number,
    number,
  ] = rows[0];

  return new WeekDetail(...result);
};

export const findAll = async (): Promise<WeekDetail[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_CIERRE_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    number,
    number,
  ]) => new WeekDetail(...row));
};

class WeekDetailData {
  constructor(
    public readonly id: number | null,
    public readonly control_id: number | null,
    public readonly client: string,
    public readonly project: string,
    public readonly budget_id: number,
    public readonly role_id: number,
    public readonly role: string,
    public readonly expected_hours: number,
    public readonly used_hours: number | null,
    public readonly server_updated: boolean,
  ) {}
}

export const getTableData = async (
  person: number,
): Promise<WeekDetailData[]> => {
  const { rows } = await postgres.query(
    `WITH CONTROL AS (
      SELECT
        PK_CIERRE_SEMANA,
        TO_CHAR(FECHA_INICIO, 'YYYYMMDD')::INTEGER AS FECHA_INICIO,
        TO_CHAR(FECHA_FIN, 'YYYYMMDD')::INTEGER AS FECHA_FIN
      FROM (
        SELECT
          C.PK_CIERRE_SEMANA,
          S.FECHA_INICIO,
          S.FECHA_FIN
        FROM ${WEEK_TABLE} S
        JOIN ${CONTROL_TABLE} C ON S.PK_SEMANA = COALESCE(C.FK_SEMANA, 1284)
        WHERE C.FK_PERSONA = $1
        AND C.BAN_ESTADO = FALSE
        UNION ALL
        SELECT
          NULL AS PK_INICIO_SEMANA,
          FECHA_INICIO,
          FECHA_FIN
        FROM ${WEEK_TABLE}
        WHERE NOW() - INTERVAL '1 WEEK' BETWEEN FECHA_INICIO AND FECHA_FIN
        AND NOT EXISTS (
          SELECT 1
          FROM ${CONTROL_TABLE}
          WHERE FK_PERSONA = $1
          AND BAN_ESTADO = FALSE
        )
      ) A
    ), TOTAL AS (
      SELECT
        C.PK_CIERRE_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        SUM(A.HORAS) AS HORAS
      FROM
        ${ASSIGNATION_TABLE} A
      JOIN
        CONTROL C
        ON A.FECHA BETWEEN C.FECHA_INICIO AND C.FECHA_FIN
        WHERE A.FK_PERSONA = $1
      GROUP BY
        C.PK_CIERRE_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL
    )
    SELECT
      REG.PK_REGISTRO AS ID,
      TOTAL.PK_CIERRE_SEMANA AS CONTROL_ID,
      CLI.NOMBRE AS CLIENT,
      PROY.NOMBRE AS PROJECT,
      TOTAL.FK_PRESUPUESTO AS BUDGET_ID,
      TOTAL.FK_ROL AS ROLE_ID,
      ROL.NOMBRE AS ROLE,
      SUM(TOTAL.HORAS) AS EXPECTED_HOURS,
      REG.HORAS AS USED_HOURS,
      TRUE AS SERVER_UPDATED
    FROM TOTAL
    LEFT JOIN
      ${TABLE} AS REG
      ON REG.FK_PRESUPUESTO = TOTAL.FK_PRESUPUESTO
      AND REG.FK_ROL = TOTAL.FK_ROL
      AND REG.FK_CIERRE_SEMANA = TOTAL.PK_CIERRE_SEMANA
    JOIN
      ${BUDGET_TABLE} AS PRES
      ON PRES.PK_PRESUPUESTO = TOTAL.FK_PRESUPUESTO
    JOIN
      ${ROLE_TABLE} AS ROL
      ON ROL.PK_ROL = TOTAL.FK_ROL
    JOIN
      ${PROJECT_TABLE} AS PROY
      ON PROY.PK_PROYECTO = PRES.FK_PROYECTO
    JOIN
      ${CLIENT_TABLE} AS CLI
      ON CLI.PK_CLIENTE = PROY.FK_CLIENTE
    GROUP BY
      REG.PK_REGISTRO,
      TOTAL.PK_CIERRE_SEMANA,
      TOTAL.FK_PRESUPUESTO,
      TOTAL.FK_ROL,
      ROL.NOMBRE,
      CLI.PK_CLIENTE,
      PROY.PK_PROYECTO,
      REG.HORAS`,
    person,
  );

  return rows.map((row: [
    number | null,
    number | null,
    string,
    string,
    number,
    number,
    string,
    number,
    number | null,
    boolean,
  ]) => new WeekDetailData(...row));
};
