import postgres from "../../services/postgres.js";

class Persona {
  constructor(
    public readonly pk_persona: number,
    public nombre: string,
  ) {}
}

export const findAll = async (): Promise<Persona[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_PERSONA, NOMBRE FROM ORGANIZACION.PERSONA",
  );

  const models = rows.map((row: [
    number,
    string,
  ]) => new Persona(...row));

  return models;
};
