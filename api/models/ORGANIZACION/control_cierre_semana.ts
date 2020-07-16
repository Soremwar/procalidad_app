import postgres from "../../services/postgres.js";
import {
  TABLE as TIME_TABLE,
} from "../MAESTRO/dim_tiempo.ts";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";
import {
  TABLE as ASSIGNATION_TABLE,
} from "../asignacion/asignacion.ts";
import {
  TABLE as REGISTRY_TABLE,
} from "./registro_detalle.ts";

export const TABLE = "ORGANIZACION.CONTROL_CIERRE_SEMANA";

export class WeekControl {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly week: number,
    public closed: boolean,
    public close_date: Date | null,
  ) {}

  async close(): Promise<WeekControl> {
    const validation = await validateWeek(this.person, this.week);

    if (!validation.goal_reached) {
      throw new Error(
        "Las horas registradas no coinciden con el esperado semanal",
      );
    }
    if (!validation.assignation_completed) {
      throw new Error("Las horas registradas exceden la asignacion aprobada");
    }

    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        BAN_ESTADO = TRUE,
        FECHA_CIERRE = NOW()
      WHERE PK_CIERRE_SEMANA = $1
      RETURNING FECHA_CIERRE`,
      this.id,
    );

    this.closed = true;
    this.close_date = rows[0][0] as Date;

    await createNewWeek(this.person, this.week);

    return this;
  }
}

export const createNewControl = async (
  person: number,
): Promise<WeekControl> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO
    ) VALUES (
      $1,
      (
        SELECT
          PK_SEMANA
        FROM ${WEEK_TABLE}
        WHERE COD_SEMANA < (
          SELECT
            COD_SEMANA
          FROM ${WEEK_TABLE}
          WHERE NOW() BETWEEN FECHA_INICIO AND FECHA_FIN
        )
        ORDER BY COD_SEMANA DESC
        LIMIT 1
      ),
      FALSE
    ) RETURNING PK_CIERRE_SEMANA, FK_SEMANA`,
    person,
  );

  const [id, week]: [number, number] = rows[0];

  return new WeekControl(
    id,
    person,
    week,
    false,
    null,
  );
};

export const createNewWeek = async (
  person: number,
  prev_week: number,
): Promise<WeekControl> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO
    ) VALUES (
      $1,
      (
        SELECT
          PK_SEMANA
        FROM ${WEEK_TABLE}
        WHERE COD_SEMANA > (
          SELECT
            COD_SEMANA
          FROM ${WEEK_TABLE}
          WHERE PK_SEMANA = $2
        )
        ORDER BY COD_SEMANA ASC
        LIMIT 1
      ),
      FALSE
    ) RETURNING PK_CIERRE_SEMANA, FK_SEMANA`,
    person,
    prev_week,
  );

  const [id, week]: [number, number] = rows[0];

  return new WeekControl(
    id,
    person,
    week,
    false,
    null,
  );
};

export const findAll = async (): Promise<WeekControl[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CIERRE_SEMANA,
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    boolean,
    Date,
  ]) => new WeekControl(...row));
};

export const findById = async (id: number): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CIERRE_SEMANA,
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE PK_PRESUPUESTO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    boolean,
    Date,
  ] = rows[0];

  return new WeekControl(...result);
};

export const findByPersonAndDate = async (
  person: number,
  date: number,
): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CIERRE_SEMANA,
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE FK_SEMANA = (
      SELECT PK_SEMANA
      FROM ${WEEK_TABLE}
      WHERE TO_DATE($2::VARCHAR, 'YYYYMMDD') BETWEEN FECHA_INICIO AND FECHA_FIN 
    )
    AND FK_PERSONA = $1`,
    person,
    date,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    boolean,
    Date | null,
  ] = rows[0];

  return new WeekControl(...result);
};

export const findOpenWeek = async (
  person: number,
): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CIERRE_SEMANA,
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE BAN_ESTADO = FALSE
    AND FK_PERSONA = $1`,
    person,
  );

  if (!rows.length) return null;

  const result: [
    number,
    number,
    number,
    boolean,
    Date | null,
  ] = rows[0];

  return new WeekControl(...result);
};

/*
* Returns the first day of the open week of as YYYYMMDD
* If no open week is found it calculates the last available week and returns the day
* If no week control is found, it returns the date of the last week
* */
export const getOpenWeekAsDate = async (person: number): Promise<number> => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(FECHA_INICIO, 'YYYYMMDD')::INTEGER
    FROM (
      SELECT
        S.FECHA_INICIO
      FROM ${TABLE} AS C
      JOIN ${WEEK_TABLE} AS S ON C.FK_SEMANA = S.PK_SEMANA
      WHERE C.BAN_ESTADO = FALSE
      AND C.FK_PERSONA = $1
      UNION ALL
      SELECT FECHA_INICIO
      FROM (
        SELECT FECHA_INICIO
        FROM ${WEEK_TABLE}
        WHERE COD_SEMANA > (
          SELECT COD_SEMANA
          FROM ${WEEK_TABLE}
          WHERE PK_SEMANA = (
            SELECT
              MAX(FK_SEMANA)
            FROM ${TABLE}
            WHERE FK_PERSONA = $1
          )
        )
        ORDER BY COD_SEMANA ASC
        LIMIT 1
      ) A
      WHERE NOT EXISTS (
        SELECT 1
        FROM ${TABLE}
        WHERE BAN_ESTADO = FALSE
        AND FK_PERSONA = $1
      )
      UNION ALL
      SELECT
        FECHA_INICIO
      FROM (
        SELECT
          FECHA_INICIO
        FROM ${WEEK_TABLE}
        WHERE COD_SEMANA < (
          SELECT
            COD_SEMANA
          FROM ${WEEK_TABLE}
          WHERE NOW() BETWEEN FECHA_INICIO AND FECHA_FIN
        )
        ORDER BY COD_SEMANA DESC
        LIMIT 1
      ) A
      WHERE NOT EXISTS (
        SELECT 1
        FROM ${TABLE}
        WHERE FK_PERSONA = $1
      )
    ) A`,
    person,
  );

  return rows[0][0];
};

export const validateWeek = async (
  person: number,
  week: number,
): Promise<{ goal_reached: boolean; assignation_completed: boolean }> => {
  const { rows } = await postgres.query(
    `WITH DETALLE AS (
      SELECT
        S.PK_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        SUM(A.HORAS) AS ESPERADO,
        R.HORAS AS EJECUTADO
      FROM ${ASSIGNATION_TABLE} A
      JOIN ${WEEK_TABLE} S
      ON TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD') BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
      LEFT JOIN (
        SELECT
          FK_SEMANA,
          FK_PERSONA,
          FK_PRESUPUESTO,
          FK_ROL,
          HORAS
        FROM ${TABLE} AS CCS
        JOIN ${REGISTRY_TABLE} AS RD
        ON CCS.PK_CIERRE_SEMANA = RD.FK_CIERRE_SEMANA
      ) AS R
      ON S.PK_SEMANA = R.FK_SEMANA
      AND A.FK_PERSONA = R.FK_PERSONA
      AND A.FK_PRESUPUESTO = R.FK_PRESUPUESTO
      AND A.FK_ROL = R.FK_ROL
      WHERE S.PK_SEMANA = $1
      AND A.FK_PERSONA = $2
      GROUP BY
      S.PK_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        R.HORAS
    ), EJECUTADO AS (
      SELECT CASE WHEN SUM(EJECUTADO) = (
        SELECT
          SUM(1) * 9
        FROM ${TIME_TABLE} T
        JOIN ${WEEK_TABLE} S
        ON FECHA BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
        WHERE S.PK_SEMANA = $1
        AND BAN_FESTIVO = FALSE
        AND EXTRACT(ISODOW FROM T.FECHA) NOT IN (6,7)
      ) THEN TRUE ELSE FALSE END AS META_ALCANZADA FROM DETALLE
    ), IRREGULARIDADES AS (
        SELECT CASE WHEN COUNT(1) = 0 THEN TRUE ELSE FALSE END AS ASIGNACION_CUMPLIDA
      FROM DETALLE
      WHERE ESPERADO < EJECUTADO
    )
    SELECT E.META_ALCANZADA, I.ASIGNACION_CUMPLIDA
    FROM EJECUTADO E
    JOIN IRREGULARIDADES I ON 1 = 1`,
    week,
    person,
  );

  const [goal_reached, assignation_completed]: [boolean, boolean] = rows[0];

  return { goal_reached, assignation_completed };
};
