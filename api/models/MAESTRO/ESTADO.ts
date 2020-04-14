import postgres from "../../services/postgres.js";

class Estado {
  constructor(
    public readonly pk_estado: number,
    public readonly nombre: string,
    public readonly fk_pais: number,
    public readonly fips: string,
    public readonly alias: string,
  ) {}
}

export const findAll = async (): Promise<Estado[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_ESTADO, NOMBRE, FK_PAIS, FIPS, ALIAS FROM MAESTRO.ESTADO",
  );

  const models = rows.map((row: [
    number,
    string,
    number,
    string,
    string,
  ]) => new Estado(...row));

  return models;
};

export const findById = async (id: number): Promise<Estado | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_ESTADO, NOMBRE, FK_PAIS, FIPS, ALIAS FROM MAESTRO.ESTADO WHERE PK_ESTADO = $1",
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    string,
    number,
    string,
    string,
  ] = rows[0];

  return new Estado(...result);
};

export const searchByName = async (
  query: string,
  limit: number,
): Promise<Estado[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_ESTADO, NOMBRE, FK_PAIS, FIPS, ALIAS FROM MAESTRO.ESTADO WHERE UNACCENT(NOMBRE) ILIKE $1 ORDER BY NOMBRE ${limit
      ? `LIMIT ${limit}`
      : ""}`,
    `%${query || "%"}%`,
  );

  const models = rows.map((row: [
    number,
    string,
    number,
    string,
    string,
  ]) => new Estado(...row));

  return models;
};

export const searchByNameAndCountry = async (
  country: number,
  query: string,
  limit: number,
): Promise<Estado[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_ESTADO, NOMBRE, FK_PAIS, FIPS, ALIAS FROM MAESTRO.ESTADO WHERE FK_PAIS = $1 AND UNACCENT(NOMBRE) ILIKE $2 ORDER BY NOMBRE ${limit
      ? `LIMIT ${limit}`
      : ""}`,
    country,
    `%${query || "%"}%`,
  );

  const models = rows.map((row: [
    number,
    string,
    number,
    string,
    string,
  ]) => new Estado(...row));

  return models;
};
