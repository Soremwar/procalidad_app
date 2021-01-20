import postgres from "../../services/postgres.js";
import {
  findById as findControl,
  TABLE as CONTROL_TABLE,
} from "./control_semana.ts";
import { TABLE as ASSIGNATION_TABLE } from "./asignacion.ts";
import { TABLE as BUDGET_TABLE } from "./budget.ts";
import { TABLE as ROLE_TABLE } from "./ROL.ts";
import { TABLE as PROJECT_TABLE } from "./PROYECTO.ts";
import { TABLE as CLIENT_TABLE } from "../CLIENTES/CLIENTE.ts";
import { TABLE as WEEK_TABLE } from "../MAESTRO/dim_semana.ts";

export const TABLE = "OPERACIONES.REGISTRO";

class WeekDetail {
  constructor(
    public readonly id: number,
    public readonly control: number,
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
}

export const create = async (
  control: number,
  budget: number,
  role: number,
  hours: number,
): Promise<WeekDetail> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_CONTROL_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    ) RETURNING PK_REGISTRO`,
    control,
    budget,
    role,
    hours,
  );

  const id: number = rows[0][0];

  return new WeekDetail(
    id,
    control,
    budget,
    role,
    hours,
  );
};

export const findById = async (id: number): Promise<WeekDetail | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_CONTROL_SEMANA,
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

export const findByIdentifiers = async (
  control: number,
  budget: number,
  role: number,
): Promise<WeekDetail | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_CONTROL_SEMANA,
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS
    FROM ${TABLE}
    WHERE FK_CONTROL_SEMANA = $1
    AND FK_PRESUPUESTO = $2
    AND FK_ROL = $3`,
    control,
    budget,
    role,
  );

  if (!rows[0]) return null;

  return new WeekDetail(
    ...rows[0] as [
      number,
      number,
      number,
      number,
      number,
    ],
  );
};

export const getRegistryHoursByControlWeek = async (control_week: number) => {
  const { rows } = await postgres.query(
    `SELECT
      COALESCE(
        SUM(HORAS),
        0
      )
    FROM ${TABLE}
    WHERE FK_CONTROL_SEMANA = $1
    GROUP BY
      FK_CONTROL_SEMANA`,
    control_week,
  );

  return Number(rows[0]?.[0]) || 0;
};

class WeekDetailData {
  constructor(
    public readonly client: string,
    public readonly project: string,
    public readonly budget_id: number,
    public readonly role_id: number,
    public readonly role: string,
    public readonly expected_hours: number,
    public readonly used_hours: number,
    public readonly reason?: number,
  ) {}
}

export const getWeekData = async (
  person: number,
  week: number,
): Promise<WeekDetailData[]> => {
  const { rows } = await postgres.query(
    `WITH TOTAL AS (
      SELECT
        C.PK_CONTROL,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        SUM(A.HORAS) AS HORAS
      FROM ${ASSIGNATION_TABLE} A
      LEFT JOIN ${CONTROL_TABLE} C
        ON A.FK_SEMANA = C.FK_SEMANA
        AND C.FK_PERSONA = $1
    WHERE A.FK_SEMANA = $2
    AND A.FK_PERSONA = $1
      GROUP BY
        C.PK_CONTROL,
        C.FK_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL
    )
    SELECT
      CLI.NOMBRE AS CLIENT,
      PROY.NOMBRE AS PROJECT,
      TOTAL.FK_PRESUPUESTO AS BUDGET_ID,
      TOTAL.FK_ROL AS ROLE_ID,
      ROL.NOMBRE AS ROLE,
      TO_CHAR(SUM(TOTAL.HORAS), 'FM999999999.0') AS EXPECTED_HOURS,
      REG.HORAS AS USED_HOURS
    FROM TOTAL
    LEFT JOIN ${TABLE} AS REG
      ON REG.FK_PRESUPUESTO = TOTAL.FK_PRESUPUESTO
      AND REG.FK_ROL = TOTAL.FK_ROL
      AND REG.FK_CONTROL_SEMANA = TOTAL.PK_CONTROL
    JOIN ${BUDGET_TABLE} AS PRES
      ON PRES.PK_PRESUPUESTO = TOTAL.FK_PRESUPUESTO
    JOIN ${ROLE_TABLE} AS ROL
      ON ROL.PK_ROL = TOTAL.FK_ROL
    JOIN ${PROJECT_TABLE} AS PROY
      ON PROY.PK_PROYECTO = PRES.FK_PROYECTO
    JOIN ${CLIENT_TABLE} AS CLI
      ON CLI.PK_CLIENTE = PROY.FK_CLIENTE
    GROUP BY
      CLI.PK_CLIENTE,
      PROY.PK_PROYECTO,
      TOTAL.FK_PRESUPUESTO,
      TOTAL.FK_ROL,
      ROL.NOMBRE,
      REG.HORAS`,
    person,
    week,
  );

  return rows.map((row: [
    string,
    string,
    number,
    number,
    string,
    number,
    number,
  ]) => new WeekDetailData(...row));
};

/**
 * This method won't return the reason for change, since current week
 * registry can't be edited by the app administrators
 */
export const getCurrentWeekData = async (
  person: number,
): Promise<WeekDetailData[]> => {
  const { rows } = await postgres.query(
    `WITH SEMANA_ABIERTA AS (
      SELECT
        C.FK_SEMANA AS PK_SEMANA
      FROM ${CONTROL_TABLE} AS C
      JOIN ${WEEK_TABLE} AS S ON C.FK_SEMANA = S.PK_SEMANA
      WHERE C.BAN_CERRADO = FALSE
      AND C.FK_PERSONA = $1
      UNION ALL
      SELECT PK_SEMANA
      FROM (
        SELECT PK_SEMANA
        FROM ${WEEK_TABLE}
        WHERE COD_SEMANA > (
          SELECT COD_SEMANA
          FROM ${WEEK_TABLE}
          WHERE PK_SEMANA = (
            SELECT
              MAX(FK_SEMANA)
            FROM ${CONTROL_TABLE}
            WHERE FK_PERSONA = $1
          )
        )
        ORDER BY COD_SEMANA ASC
        LIMIT 1
      ) A
      WHERE NOT EXISTS (
        SELECT 1
        FROM ${CONTROL_TABLE}
        WHERE BAN_CERRADO = FALSE
        AND FK_PERSONA = $1
      )
      UNION ALL
      SELECT
        PK_SEMANA
      FROM (
        SELECT
          PK_SEMANA
        FROM ${WEEK_TABLE}
        WHERE COD_SEMANA < (
          SELECT
            COD_SEMANA
          FROM ${WEEK_TABLE}
          WHERE CURRENT_DATE BETWEEN FECHA_INICIO AND FECHA_FIN
        )
        ORDER BY COD_SEMANA DESC
        LIMIT 1
      ) A
      WHERE NOT EXISTS (
        SELECT 1
        FROM ${CONTROL_TABLE}
        WHERE FK_PERSONA = $1
      )
    ), TOTAL AS (
      SELECT
        C.PK_CONTROL,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        SUM(A.HORAS) AS HORAS
      FROM ${ASSIGNATION_TABLE} A
      LEFT JOIN ${CONTROL_TABLE} C
        ON A.FK_SEMANA = C.FK_SEMANA
        AND C.FK_PERSONA = $1
        AND C.BAN_CERRADO = FALSE
    WHERE A.FK_SEMANA = (SELECT PK_SEMANA FROM SEMANA_ABIERTA)
    AND A.FK_PERSONA = $1
      GROUP BY
        C.PK_CONTROL,
        A.FK_PRESUPUESTO,
        A.FK_ROL
    )
    SELECT
      CLI.NOMBRE AS CLIENT,
      PROY.NOMBRE AS PROJECT,
      TOTAL.FK_PRESUPUESTO AS BUDGET_ID,
      TOTAL.FK_ROL AS ROLE_ID,
      ROL.NOMBRE AS ROLE,
      TO_CHAR(SUM(TOTAL.HORAS), 'FM999999999.0') AS EXPECTED_HOURS,
      COALESCE(REG.HORAS, 0) AS USED_HOURS
    FROM TOTAL
    LEFT JOIN ${TABLE} AS REG
      ON REG.FK_PRESUPUESTO = TOTAL.FK_PRESUPUESTO
      AND REG.FK_ROL = TOTAL.FK_ROL
      AND REG.FK_CONTROL_SEMANA = TOTAL.PK_CONTROL
    JOIN ${BUDGET_TABLE} AS PRES
      ON PRES.PK_PRESUPUESTO = TOTAL.FK_PRESUPUESTO
    JOIN ${ROLE_TABLE} AS ROL
      ON ROL.PK_ROL = TOTAL.FK_ROL
    JOIN ${PROJECT_TABLE} AS PROY
      ON PROY.PK_PROYECTO = PRES.FK_PROYECTO
    JOIN ${CLIENT_TABLE} AS CLI
      ON CLI.PK_CLIENTE = PROY.FK_CLIENTE
    GROUP BY
      CLI.PK_CLIENTE,
      PROY.PK_PROYECTO,
      TOTAL.FK_PRESUPUESTO,
      TOTAL.FK_ROL,
      ROL.NOMBRE,
      REG.HORAS`,
    person,
  );

  return rows.map((row: [
    string,
    string,
    number,
    number,
    string,
    number,
    number,
  ]) => new WeekDetailData(...row));
};
