import postgres from "../../services/postgres.ts";

export const TABLE = "OPERACIONES.REGISTRO_AUDITORIA";

class RegistryLog {
  constructor(
    public readonly registry: number,
    public readonly person: number,
    public readonly reason: string,
    public readonly created: Date,
  ) {}
}

export const create = async (
  registry: number,
  person: number,
  reason: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_REGISTRO,
      FK_PERSONA,
      JUSTIFICACION,
      FEC_CAMBIO
    ) VALUES (
      $1,
      $2,
      $3,
      NOW()
    ) RETURNING FEC_CAMBIO`,
    registry,
    person,
    reason,
  );

  const create: string = rows[0][0];

  return new RegistryLog(
    registry,
    person,
    reason,
    new Date(create),
  );
};
