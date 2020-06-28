import postgres from "../../services/postgres.js";

const TABLE = "MAESTRO.DIM_TIEMPO";

/*
* Receives a YYYYMMDD type number
* */
export const addLaboralDays = async (
  start_date: number,
  days: number,
): Promise<number> => {
  const { rows } = await postgres.query(
    `SELECT MAX(COD_FECHA) AS DAY
    FROM(
      SELECT 
        COD_FECHA
      FROM ${TABLE}
      WHERE COD_FECHA >= $1
      AND EXTRACT(ISODOW FROM FECHA) NOT IN (6,7)
      AND BAN_FESTIVO = FALSE
      ORDER BY COD_FECHA
      LIMIT $2
    ) AS DATES`,
    start_date,
    days,
  );

  const end_date: number = rows[0][0];

  return end_date;
};

export const getLaboralDaysBetween = async (
  start_date: number,
  end_date: number,
): Promise<number[]> => {
  const { rows } = await postgres.query(
    `SELECT 
      COD_FECHA
    FROM ${TABLE}
    WHERE COD_FECHA BETWEEN $1 AND $2
    AND EXTRACT(ISODOW FROM FECHA) NOT IN (6,7)
    AND BAN_FESTIVO = FALSE`,
    start_date,
    end_date,
  );

  const days: number[] = rows.reduce((total: number[], [day]: [number]) => {
    total.push(day);
    return total;
  }, []);

  return days;
};

export const getNonLaboralDaysBetween = async (
  start_date: number,
  end_date: number,
): Promise<number[]> => {
  const { rows } = await postgres.query(
    `SELECT 
      COD_FECHA
    FROM ${TABLE}
    WHERE COD_FECHA BETWEEN $1 AND $2
    AND EXTRACT(ISODOW FROM FECHA) IN (6,7)
    OR BAN_FESTIVO = TRUE`,
    start_date,
    end_date,
  );

  const days: number[] = rows.reduce((total: number[], [day]: [number]) => {
    total.push(day);
    return total;
  }, []);

  return days;
};
