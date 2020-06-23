import postgres from "../../services/postgres.js";

export const TABLE = "MAESTRO.PAIS";

class Pais {
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
    "SELECT PK_PAIS, NOMBRE, ALIAS, COD_TELEFONO, MONEDA FROM MAESTRO.PAIS",
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

export const findById = async (id: number): Promise<Pais | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_PAIS, NOMBRE, ALIAS, COD_TELEFONO, MONEDA FROM MAESTRO.PAIS WHERE PK_PAIS = $1",
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    string,
    string,
    number,
    string,
  ] = rows[0];

  return new Pais(...result);
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
  ).catch((err: any) => {
    console.log("it explodes in the query");
    console.log(err.toString());
    throw err;
  });

  const models = rows.map((row: [
    number,
    string,
    string,
    number,
    string,
  ]) => new Pais(...row));

  return models;
};
