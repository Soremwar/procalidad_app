import postgres from "../../services/postgres.ts";
import { TABLE as TIME_TABLE } from "../MAESTRO/dim_tiempo.ts";
import { TABLE as WEEK_TABLE } from "../MAESTRO/dim_semana.ts";
import { TABLE as ASSIGNATION_TABLE } from "./asignacion.ts";
import { TABLE as REGISTRY_TABLE } from "./registro.ts";

export const TABLE = "OPERACIONES.CONTROL_SEMANA";

export class WeekControl {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly week: number,
    public closed: boolean,
    public close_date: Date | null,
  ) {}

  async clearRegistry(): Promise<void>;
  async clearRegistry(
    budget: number,
    role: number,
  ): Promise<void>;
  async clearRegistry(
    budget?: number,
    role?: number,
  ): Promise<void> {
    const condition = budget && role
      ? `AND FK_PRESUPUESTO = ${budget} AND FK_ROL = ${role}`
      : "";

    await postgres.query(
      `DELETE FROM ${REGISTRY_TABLE}
      WHERE FK_CONTROL_SEMANA = $1
      ${condition}`,
      this.id,
    );
  }

  async close(open_next_week = true): Promise<WeekControl> {
    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        BAN_CERRADO = TRUE,
        FECHA_CIERRE = NOW()
      WHERE PK_CONTROL = $1
      RETURNING FECHA_CIERRE`,
      this.id,
    );

    this.closed = true;
    this.close_date = rows[0][0] as Date;

    if (open_next_week) {
      await createNewWeek(this.person, this.week);
    }

    return this;
  }

  /** Should only be used to rollback a bad user creation operation */
  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_CONTROL = $1`,
      this.id,
    );
  }
}

export const create = async (
  person: number,
  week: number,
): Promise<WeekControl> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO
    ) VALUES (
      $1,
      $2,
      FALSE
    ) RETURNING PK_CONTROL`,
    person,
    week,
  );

  const id: number = rows[0][0];

  return new WeekControl(
    id,
    person,
    week,
    false,
    null,
  );
};

/*
* Will skip and close weeks that don't contain any laboral day
* */
export const createNewWeek = async (
  person: number,
  prev_week: number,
): Promise<WeekControl> => {
  const { rows } = await postgres.query(
    `WITH FECHA AS (
      SELECT MIN(FECHA) AS MIN, MAX(FECHA) AS MAX
      FROM ${TIME_TABLE} DT
      WHERE FECHA > (SELECT FECHA_FIN FROM ${WEEK_TABLE} DS WHERE PK_SEMANA = $2)
      AND FECHA <= (
        SELECT FECHA
        FROM ${TIME_TABLE} DT
        WHERE FECHA > (SELECT FECHA_FIN FROM ${WEEK_TABLE} DS WHERE PK_SEMANA = $2)
        AND EXTRACT(ISODOW FROM FECHA) NOT IN (6,7)
        AND BAN_FESTIVO = FALSE
        ORDER BY COD_FECHA ASC
        LIMIT 1
      )
    )
    INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO,
      FECHA_CIERRE
    )
    SELECT
      $1,
      PK_SEMANA,
      CASE WHEN ROW_NUMBER() OVER (ORDER BY FECHA_INICIO DESC) = 2 THEN TRUE ELSE FALSE END AS CLOSED,
      CASE WHEN ROW_NUMBER() OVER (ORDER BY FECHA_INICIO DESC) = 2 THEN NOW() ELSE NULL END AS CLOSE_DATE
    FROM ${WEEK_TABLE} WHERE FECHA_INICIO BETWEEN (SELECT MIN FROM FECHA) AND (SELECT MAX FROM FECHA)
    RETURNING PK_CONTROL, FK_SEMANA`,
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
      PK_CONTROL,
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO,
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
      PK_CONTROL,
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE PK_CONTROL = $1`,
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

//TODO
//This should run a check for a week, and if it were not to find it
//It should create it calling the createNewWeek or createNewControl functions
export const findByPersonAndDate = async (
  person: number,
  date: number,
): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTROL,
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO,
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

export const findByPersonAndWeek = async (
  person: number,
  week: number,
): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTROL,
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE FK_PERSONA = $1
    AND FK_SEMANA = $2`,
    person,
    week,
  );

  if (!rows[0]) return null;

  return new WeekControl(
    ...rows[0] as [
      number,
      number,
      number,
      boolean,
      Date | null,
    ],
  );
};

//TODO
//This should run a check for a week, and if it were not to find it
//It should create it calling the createNewWeek or createNewControl functions
export const findOpenWeek = async (
  person: number,
): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTROL,
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE BAN_CERRADO = FALSE
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
      WHERE C.BAN_CERRADO = FALSE
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
        WHERE BAN_CERRADO = FALSE
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
          WHERE CURRENT_DATE BETWEEN FECHA_INICIO AND FECHA_FIN
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

//TODO
//This should run a check for a week, and if it were not to find it
//It should create it calling the createNewWeek or createNewControl functions
export const isWeekOpen = async (
  person: number,
  week: number,
): Promise<boolean> => {
  const { rows } = await postgres.query(
    `SELECT
      CASE WHEN COUNT(1) > 0 THEN TRUE ELSE FALSE END
    FROM ${TABLE}
    WHERE FK_PERSONA = $1
    AND FK_SEMANA = $2
    AND BAN_CERRADO = FALSE`,
    person,
    week,
  );

  return rows[0][0];
};

interface ValidationResult {
  assignation_overflowed: boolean;
  time_completed: boolean;
  week_completed: boolean;
  week_overflowed: boolean;
}

export const validateWeek = async (
  person: number,
  week: number,
  registry: Array<{
    budget: number;
    role: number;
    hours: number;
  }>,
): Promise<ValidationResult> => {
  const { rows } = await postgres.query(
    //deno-fmt-ignore
    `WITH REGISTRO AS (
      SELECT
        FK_PRESUPUESTO,
        HORAS,
        FK_ROL
      FROM (
        ${
          registry.length
            ? registry
              .map(({ budget, hours, role }) =>
                `SELECT ${budget} AS FK_PRESUPUESTO, ${hours} AS HORAS, ${role} AS FK_ROL`
              )
              .join("\nUNION ALL\n")
            // This is an empty array that will guaranteee the validation
            // Doesn't break if the user tries to early close an empty week
            : `SELECT
                UNNEST('{}'::INTEGER[]) as FK_PRESUPUESTO,
                UNNEST('{}'::INTEGER[]) as HORAS,
                UNNEST('{}'::INTEGER[]) as FK_ROL`
        }
      ) A
    ), DETALLE AS (
      SELECT
        S.PK_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        SUM(A.HORAS) AS ESPERADO,
        R.HORAS AS EJECUTADO
      FROM ${ASSIGNATION_TABLE} A
      JOIN ${WEEK_TABLE} S
      ON A.FK_SEMANA = S.PK_SEMANA
      LEFT JOIN REGISTRO AS R
      ON A.FK_PRESUPUESTO = R.FK_PRESUPUESTO
      AND A.FK_ROL = R.FK_ROL
      WHERE S.PK_SEMANA = $2
      AND A.FK_PERSONA = $1
      GROUP BY
        S.PK_SEMANA,
        A.FK_PRESUPUESTO,
        A.FK_ROL,
        R.HORAS
    ), SEMANA AS (
      SELECT
        COALESCE(SUM(EJECUTADO), 0) AS REGISTRADO,
        (
          SELECT
            COALESCE(SUM(1) * 9, 0)
          FROM ${TIME_TABLE} T
          JOIN ${WEEK_TABLE} S
          ON FECHA BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
          WHERE S.PK_SEMANA = $2
          AND BAN_FESTIVO = FALSE
          AND EXTRACT(ISODOW FROM T.FECHA) NOT IN (6,7)
        ) AS ESPERADO
      FROM DETALLE
    ), IRREGULARIDADES AS (
      SELECT
        CASE WHEN COUNT(1) = 0 THEN FALSE ELSE TRUE END AS ASIGNACION_EXCEDIDA
      FROM DETALLE
      WHERE EJECUTADO > ESPERADO
    ), CALENDARIO AS (
      SELECT
        CASE WHEN FECHA_FIN + INTERVAL '1 DAY' < NOW() THEN TRUE ELSE FALSE END AS TIEMPO_COMPLETADO
      FROM ${WEEK_TABLE}
      WHERE PK_SEMANA = $2
    )
    SELECT
      I.ASIGNACION_EXCEDIDA AS ASSIGNATION_OVERFLOWED,
      C.TIEMPO_COMPLETADO AS TIME_COMPLETED,
      S.REGISTRADO >= S.ESPERADO AS WEEK_COMPLETED,
      S.REGISTRADO > S.ESPERADO AS WEEK_OVERFLOWED
    FROM SEMANA S
    JOIN IRREGULARIDADES I ON 1 = 1
    JOIN CALENDARIO C ON 1 = 1`,
    person,
    week,
  );

  const [
    assignation_overflowed,
    time_completed,
    week_completed,
    week_overflowed,
  ]: [
    boolean,
    boolean,
    boolean,
    boolean,
  ] = rows[0];

  return {
    assignation_overflowed,
    time_completed,
    week_completed,
    week_overflowed,
  };
};
