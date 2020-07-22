import postgres from "../../services/postgres.js";

export const TABLE = "MAESTRO.DIM_SEMANA";

class Week {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly start_date: Date,
    public readonly end_date: Date,
  ) {
  }
}

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

/*
* Receives a YYYYMMDD date number and returns the id
* for the week matching that data
* */
export const findIdByDate = async (date: number): Promise<number | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SEMANA
    FROM ${TABLE}
    WHERE TO_DATE($1::VARCHAR, 'YYYYMMDD') BETWEEN FECHA_INICIO AND FECHA_FIN`,
    date,
  );

  if (!rows.length) return null;

  return rows[0][0];
};
