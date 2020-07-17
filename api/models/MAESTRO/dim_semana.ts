import postgres from "../../services/postgres.js";

export const TABLE = "MAESTRO.DIM_SEMANA";

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
