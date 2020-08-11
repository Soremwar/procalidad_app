import postgres from "../../services/postgres.js";

export const TABLE = "MAESTRO.IDIOMA";

class Language {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}
}

export const findAll = async (): Promise<Language[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_IDIOMA,
      NOMBRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
  ]) => new Language(...row));
};
