import postgres from "../../services/postgres.js";
import { TABLE as TIME_TABLE } from "./dim_tiempo.ts";

export const TABLE = "MAESTRO.DIM_SEMANA";

class Week {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly start_date: Date,
    public readonly end_date: Date,
  ) {}

  async getLaboralHours(): Promise<number> {
    const { rows } = await postgres.query(
      `SELECT
        COALESCE(SUM(1) * 9, 0)
      FROM ${TIME_TABLE} T
      JOIN ${TABLE} S
        ON T.FECHA BETWEEN S.FECHA_INICIO AND S.FECHA_FIN
      WHERE S.PK_SEMANA = $1
      AND BAN_FESTIVO = FALSE
      AND EXTRACT(ISODOW FROM T.FECHA) NOT IN (6,7)`,
      this.id,
    );

    return Number(rows[0]?.[0]) || 0;
  }

  /*
  * Get week starting date as YYYYMMDD
  * */
  async getStartDate(): Promise<number> {
    const { rows } = await postgres.query(
      `SELECT
        TO_CHAR(FECHA_INICIO, 'YYYYMMDD')::INTEGER
      FROM ${TABLE}
      WHERE PK_SEMANA = $1`,
      this.id,
    );

    return rows[0][0];
  }

  async isCurrentWeek(): Promise<boolean> {
    const { rows } = await postgres.query(
      `SELECT
        CASE WHEN CURRENT_DATE BETWEEN FECHA_INICIO AND FECHA_FIN THEN TRUE ELSE FALSE END
      FROM ${TABLE}
      WHERE PK_SEMANA = $1`,
      this.id,
    );

    return rows[0][0];
  }
}

export const findById = async (id: number): Promise<Week | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SEMANA,
      COD_SEMANA,
      FECHA_INICIO,
      FECHA_FIN
    FROM ${TABLE}
    WHERE PK_SEMANA = $1`,
    id,
  );

  if (!rows.length) return null;

  return new Week(
    ...rows[0] as [
      number,
      string,
      Date,
      Date,
    ],
  );
};

/*
* Receives a YYYYMMDD date number and returns the model
* for the week matching that data
* */
export const findByDate = async (date: number): Promise<Week | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SEMANA,
      COD_SEMANA,
      FECHA_INICIO,
      FECHA_FIN
    FROM ${TABLE}
    WHERE TO_DATE($1::VARCHAR, 'YYYYMMDD') BETWEEN FECHA_INICIO AND FECHA_FIN`,
    date,
  );

  if (!rows.length) return null;

  return new Week(
    ...rows[0] as [
      number,
      string,
      Date,
      Date,
    ],
  );
};

export const getCurrentWeek = async (): Promise<Week> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SEMANA,
      COD_SEMANA,
      FECHA_INICIO,
      FECHA_FIN
    FROM ${TABLE}
    WHERE CURRENT_DATE BETWEEN FECHA_INICIO AND FECHA_FIN`,
  );

  return new Week(
    ...rows[0] as [
      number,
      string,
      Date,
      Date,
    ],
  );
};
