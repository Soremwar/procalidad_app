import postgres from "../../services/postgres.js";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";

export const TABLE = "ORGANIZACION.CONTROL_CIERRE_SEMANA";

class WeekControl {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly week: number,
    public status: boolean,
    public close_date: Date | null,
  ) {}

  async close(): Promise<void> {
    await postgres.query(
      `UPDATE ${TABLE} SET
        BAN_ESTADO = TRUE,
        FECHA_CIERRE = NOW()
      WHERE PK_CIERRE_SEMANA = $1`,
      this.id,
    );

    await createNewWeek(this.person, this.week);
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
      (SELECT PK_SEMANA FROM ${WEEK_TABLE} WHERE NOW() - INTERVAL '1 WEEK' BETWEEN FECHA_INICIO AND FECHA_FIN),
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
        SELECT PK_SEMANA
        FROM ${WEEK_TABLE}
        WHERE (
          SELECT FECHA_INICIO + INTERVAL '1 WEEK'
          FROM ${WEEK_TABLE}
          WHERE PK_SEMANA = $2
        ) BETWEEN FECHA_INICIO AND FECHA_FIN
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

/*
* Returns the first day of the open week of the registry as YYYYMMDD
* If no person is provided, it will return the lowest open week available
* */
export const findLastOpenWeek = async (person?: number): Promise<number> => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(COALESCE(
        MIN(S.FECHA_INICIO),
        (SELECT FECHA_INICIO FROM MAESTRO.DIM_SEMANA WHERE NOW() BETWEEN FECHA_INICIO AND FECHA_FIN)
      ), 'YYYYMMDD') AS FECHA
    FROM ORGANIZACION.CONTROL_CIERRE_SEMANA AS C
    JOIN MAESTRO.DIM_SEMANA AS S ON C.FK_SEMANA = S.PK_SEMANA
    ${person ? `WHERE C.FK_PERSONA = ${person}` : ""}`,
  );

  return rows[0][0];
};
