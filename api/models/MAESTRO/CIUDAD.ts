import postgres from "../../services/postgres.js";

class Ciudad {
  constructor(
    public readonly pk_ciudad: number,
    public readonly nombre: string,
    public readonly fk_estado: number,
  ) {}
}

export const findAll = async (): Promise<Ciudad[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_CIUDAD, NOMBRE, FK_ESTADO FROM MAESTRO.CIUDAD",
  );

  const models = rows.map((row: [
    number,
    string,
    number,
  ]) => new Ciudad(...row));

  return models;
};

export const findById = async (id: number): Promise<Ciudad | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_CIUDAD, NOMBRE, FK_ESTADO FROM MAESTRO.CIUDAD WHERE PK_CIUDAD = $1",
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    string,
    number,
  ] = rows[0];

  return new Ciudad(...result);
};

export const searchByName = async (
  query: string,
  limit: number,
): Promise<Ciudad[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_CIUDAD, NOMBRE, FK_ESTADO FROM MAESTRO.CIUDAD WHERE UNACCENT(NOMBRE) ILIKE $1 ORDER BY NOMBRE ${limit
      ? `LIMIT ${limit}`
      : ""}`,
    `%${query || "%"}%`,
    limit,
  );

  const models = rows.map((row: [
    number,
    string,
    number,
  ]) => new Ciudad(...row));

  return models;
};

export const searchByNameAndState = async (
  state: number,
  query: string,
  limit: number,
): Promise<Ciudad[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_CIUDAD, NOMBRE, FK_ESTADO FROM MAESTRO.CIUDAD WHERE FK_ESTADO = $1 AND UNACCENT(NOMBRE) ILIKE $2 ORDER BY NOMBRE ${limit
      ? `LIMIT ${limit}`
      : ""}`,
    state,
    `%${query || "%"}%`,
  );

  const models = rows.map((row: [
    number,
    string,
    number,
  ]) => new Ciudad(...row));

  return models;
};
