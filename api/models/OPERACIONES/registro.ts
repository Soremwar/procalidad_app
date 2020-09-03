import postgres from "../../services/postgres.js";
import {
  findById as findControl,
  TABLE as CONTROL_TABLE,
} from "./control_semana.ts";
import {
  TABLE as ASSIGNATION_TABLE,
} from "./asignacion.ts";
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
  TABLE as CLIENT_TABLE,
} from "../CLIENTES/CLIENTE.ts";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";

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

    const control = await findControl(this.control);
    //Shouldn't ever happen cause of constraints
    if (!control) throw new Error("La semana referenciada no existe");

    if (control.closed) {
      throw new Error(
        "La semana a la que pertenece este registro se encuentra cerrada",
      );
    }

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

export const createNew = async (
  control: number,
  budget: number,
  role: number,
  hours: number,
): Promise<WeekDetail> => {
  const week_control = await findControl(control);
  //Shouldn't ever happen cause of constraints
  if (!week_control) throw new Error("La semana referenciada no existe");

  if (week_control.closed) {
    throw new Error(
      "La semana a la que pertenece este registro se encuentra cerrada",
    );
  }
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

export const getAll = async (): Promise<WeekDetail[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REGISTRO,
      FK_CONTROL_SEMANA,
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
        C.FK_SEMANA,
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
        C.FK_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL
    )
    SELECT
      REG.PK_REGISTRO AS ID,
      TOTAL.PK_CONTROL AS CONTROL_ID,
      CLI.NOMBRE AS CLIENT,
      PROY.NOMBRE AS PROJECT,
      TOTAL.FK_PRESUPUESTO AS BUDGET_ID,
      TOTAL.FK_ROL AS ROLE_ID,
      ROL.NOMBRE AS ROLE,
      TO_CHAR(SUM(TOTAL.HORAS), 'FM999999999.0') AS EXPECTED_HOURS,
      REG.HORAS AS USED_HOURS,
      TRUE AS SERVER_UPDATED
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
      REG.PK_REGISTRO,
      TOTAL.PK_CONTROL,
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
