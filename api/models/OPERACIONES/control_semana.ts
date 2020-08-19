import postgres from "../../services/postgres.js";
import {
  TABLE as TIME_TABLE,
} from "../MAESTRO/dim_tiempo.ts";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";
import {
  TABLE as ASSIGNATION_TABLE,
} from "./asignacion.ts";
import {
  deleteByWeekControl as deleteAssignationRequests,
} from "./asignacion_solicitud.ts";
import {
  TABLE as REGISTRY_TABLE,
} from "./registro.ts";

export const TABLE = "OPERACIONES.CONTROL_SEMANA";

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
    if (!validation.time_completed) {
      throw new Error(
        "La semana a cerrar aun se encuentra en curso",
      );
    }

    await deleteAssignationRequests(this.id);

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

    await createNewWeek(this.person, this.week);

    return this;
  }

  /*
  * This function recalculates the registry and deletes not matching records from the assignation
  * If an assignation is provided, it will tell the registry to remove every record that follows that assignation
  * as if it was already deleted
  * */
  async clearRegistry(assignation?: number): Promise<void> {
    await postgres.query(
      `DELETE FROM ${REGISTRY_TABLE}
      WHERE FK_CONTROL_SEMANA||'_'||FK_PRESUPUESTO||'_'||FK_ROL NOT IN (
        SELECT C.PK_CONTROL||'_'||A.FK_PRESUPUESTO||'_'||A.FK_ROL
        FROM ${ASSIGNATION_TABLE} A
        JOIN ${TABLE} C
        ON A.FK_SEMANA = C.FK_SEMANA
        AND A.FK_PERSONA = C.FK_PERSONA
        WHERE A.FK_SEMANA = $1
        ${assignation ? `AND A.PK_ASIGNACION <> ${assignation}` : ""}
      )`,
      this.id,
    );
  }
}

export const createNewControl = async (
  person: number,
): Promise<WeekControl> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SEMANA,
      BAN_CERRADO
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
    ) RETURNING PK_CONTROL, FK_SEMANA`,
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
      FROM MAESTRO.DIM_TIEMPO DT
      WHERE FECHA > (SELECT FECHA_FIN FROM MAESTRO.DIM_SEMANA DS WHERE PK_SEMANA = $2)
      AND FECHA <= (
        SELECT FECHA
        FROM MAESTRO.DIM_TIEMPO DT
        WHERE FECHA > (SELECT FECHA_FIN FROM MAESTRO.DIM_SEMANA DS WHERE PK_SEMANA = $2)
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
    FROM MAESTRO.DIM_SEMANA WHERE FECHA_INICIO BETWEEN (SELECT MIN FROM FECHA) AND (SELECT MAX FROM FECHA)
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
    FROM OPERACIONES.CONTROL_SEMANA
    WHERE FK_PERSONA = $1
    AND FK_SEMANA = $2
    AND BAN_CERRADO = FALSE`,
    person,
    week,
  );

  return rows[0][0];
};

export const validateWeek = async (
  person: number,
  week: number,
): Promise<
  {
    goal_reached: boolean;
    assignation_completed: boolean;
    time_completed: boolean;
  }
> => {
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
      ON A.FK_SEMANA = S.PK_SEMANA
      LEFT JOIN (
        SELECT
          FK_SEMANA,
          FK_PERSONA,
          FK_PRESUPUESTO,
          FK_ROL,
          HORAS
        FROM ${TABLE} AS CCS
        JOIN ${REGISTRY_TABLE} AS RD
        ON CCS.PK_CONTROL = RD.FK_CONTROL_SEMANA
      ) AS R
      ON S.PK_SEMANA = R.FK_SEMANA
      AND A.FK_PERSONA = R.FK_PERSONA
      AND A.FK_PRESUPUESTO = R.FK_PRESUPUESTO
      AND A.FK_ROL = R.FK_ROL
      WHERE S.PK_SEMANA = $2
      AND A.FK_PERSONA = $1
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
        WHERE S.PK_SEMANA = $2
        AND BAN_FESTIVO = FALSE
        AND EXTRACT(ISODOW FROM T.FECHA) NOT IN (6,7)
      ) THEN TRUE ELSE FALSE END AS META_ALCANZADA FROM DETALLE
    ), IRREGULARIDADES AS (
      SELECT
        CASE WHEN COUNT(1) = 0 THEN TRUE ELSE FALSE END AS ASIGNACION_CUMPLIDA
      FROM DETALLE
      WHERE ESPERADO < EJECUTADO
    ), CALENDARIO AS (
      SELECT
        CASE WHEN FECHA_FIN + INTERVAL '1 DAY' < NOW() THEN TRUE ELSE FALSE END AS TIEMPO_COMPLETADO
      FROM ${WEEK_TABLE}
      WHERE PK_SEMANA = $2
    )
    SELECT
      E.META_ALCANZADA,
      I.ASIGNACION_CUMPLIDA,
      C.TIEMPO_COMPLETADO
    FROM EJECUTADO E
    JOIN IRREGULARIDADES I ON 1 = 1
    JOIN CALENDARIO C ON 1 = 1`,
    person,
    week,
  );

  const [goal_reached, assignation_completed, time_completed]: [
    boolean,
    boolean,
    boolean,
  ] = rows[0];

  return { goal_reached, assignation_completed, time_completed };
};
