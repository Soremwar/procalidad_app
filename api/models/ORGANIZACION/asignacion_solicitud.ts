import postgres from "../../services/postgres.js";

export const TABLE = "ORGANIZACION.ASIGNACION_SOLICITUD";

class AssignationRequest {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly budget: number,
    public readonly role: number,
    public readonly date: Date,
    public readonly horas: number,
    public readonly description: string,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_SOLICITUD = $1`,
      this.id,
    );
  }
}

export const createNew = async (
  person: number,
  budget: number,
  role: number,
  date: Date,
  horas: number,
  description: string,
): Promise<AssignationRequest> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA,
      HORAS,
      DESCRIPCION
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    ) RETURNING PK_SOLICITUD`,
    person,
    budget,
    role,
    date,
    horas,
    description,
  );

  const id: number = rows[0][0];

  return new AssignationRequest(
    id,
    person,
    budget,
    role,
    date,
    horas,
    description,
  );
};
