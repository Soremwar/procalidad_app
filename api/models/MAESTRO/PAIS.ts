import postgres from "../../services/postgres.ts";

export const TABLE = "MAESTRO.PAIS";

export class Pais {
  constructor(
    public readonly pk_pais: number,
    public readonly nombre: string,
    public readonly alias: string,
    public readonly cod_telefono: number,
    public readonly moneda: string,
  ) {}
}

export const findAll = async (): Promise<Pais[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PAIS,
      NOMBRE,
      ALIAS,
      COD_TELEFONO,
      MONEDA
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
    string,
    number,
    string,
  ]) => new Pais(...row));
};

export const findById = async (id: number): Promise<Pais | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PAIS,
      NOMBRE,
      ALIAS,
      COD_TELEFONO,
      MONEDA
    FROM ${TABLE}
    WHERE PK_PAIS = $1`,
    id,
  );

  if (!rows[0]) return null;

  return new Pais(
    ...rows[0] as [
      number,
      string,
      string,
      number,
      string,
    ],
  );
};

export const findByName = async (name: string): Promise<Pais | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PAIS,
      NOMBRE,
      ALIAS,
      COD_TELEFONO,
      MONEDA
    FROM ${TABLE}
    WHERE NOMBRE ILIKE $1`,
    name,
  );

  if (!rows[0]) return null;

  return new Pais(
    ...rows[0] as [
      number,
      string,
      string,
      number,
      string,
    ],
  );
};

export const searchByName = async (
  query: string,
  limit: number,
): Promise<Pais[]> => {
  const { rows } = await postgres.query(
    `SELECT PK_PAIS, NOMBRE, ALIAS, COD_TELEFONO, MONEDA FROM MAESTRO.PAIS WHERE UNACCENT(NOMBRE) ILIKE $1 ORDER BY NOMBRE ${
      limit ? `LIMIT ${limit}` : ""
    }`,
    `%${query || "%"}%`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
    number,
    string,
  ]) => new Pais(...row));

  return models;
};
