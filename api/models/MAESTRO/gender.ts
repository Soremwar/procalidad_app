import postgres from "../../services/postgres.ts";

export const TABLE = "MAESTRO.GENERO";

class Gender {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}
}

export const findAll = async (): Promise<Gender[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_GENERO,
      NOMBRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
  ]) => new Gender(...row));
};
