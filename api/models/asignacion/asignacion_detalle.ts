import postgres from "../../services/postgres.js";

export const TABLE = "ASIGNACION.ASIGNACION_DETALLE";

export class AsignacionDetalle {
  constructor(
    public fk_asignacion: number,
    public fecha: number,
    public horas: number,
  ) {}
}

export const findByAssignation = async (
  resource: number,
): Promise<AsignacionDetalle[]> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_ASIGNACION,
      FECHA,
      HORAS,
    FROM ${TABLE}
    WHERE FK_ASIGNACION = $1`,
    resource,
  );

  return rows.map((row: [
    number,
    number,
    number,
  ]) => new AsignacionDetalle(...row));
};

export const createNew = async (
  fk_recurso: number,
  fecha: number,
  horas: number,
): Promise<AsignacionDetalle> => {
  await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_ASIGNACION,
      FECHA,
      HORAS
    ) VALUES ($1, $2, $3)`,
    fk_recurso,
    fecha,
    horas,
  );

  return new AsignacionDetalle(
    fk_recurso,
    fecha,
    horas,
  );
};

export const deleteByResource = async (resource: number): Promise<void> => {
  await postgres.query(
    `DELETE FROM ${TABLE}
    WHERE FK_ASIGNACION = $1`,
    resource,
  );
};
