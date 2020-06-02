import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";

const TABLE = "PLANEACION.RECURSO_DETALLE";

class RecursoDetalle {
  constructor(
    public fk_recurso: number,
    public fecha: number,
    public horas: number,
  ) { }
}

export const findByResource = async (resource: number): Promise<RecursoDetalle | null> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_RECURSO,
      FECHA,
      HORAS,
    FROM ${TABLE}
    WHERE FK_RECURSO = $1`,
    resource,
  );

  const models = rows.map((row: [
    number,
    number,
    number,
  ]) => new RecursoDetalle(...row));

  return models;
};

export const createNew = async (
  fk_recurso: number,
  fecha: number,
  horas: number,
): Promise<RecursoDetalle> => {
  await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_RECURSO,
      FECHA,
      HORAS
    ) VALUES ($1, $2, $3)`,
    fk_recurso,
    fecha,
    horas,
  );

  return new RecursoDetalle(
    fk_recurso,
    fecha,
    horas,
  );
};

export const deleteByResource = async (resource: number): Promise<void> => {
  await postgres.query(
    `DELETE FROM ${TABLE}
    WHERE FK_RECURSO = $1`,
    resource,
  );
};
