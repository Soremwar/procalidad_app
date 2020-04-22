import postgres from "../../services/postgres.js";

const TABLE = "OPERACIONES.PRESUPUESTO_DETALLE";

class PresupuestoDetalle {
  constructor(
    public readonly fk_presupuesto: number,
    public readonly fk_rol: number,
    public readonly horas: number,
    public readonly tarifa_hora: number,
  ) {}
}

export const findByBudget = async (budget: number) => {
  const { rows } = await postgres.query(
    `SELECT
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS,
      TARIFA_HORA
    FROM ${TABLE}
    WHERE FK_PRESUPUESTO = $1`,
    budget,
  );
  const result = rows.map((row: [
    number,
    number,
    number,
    number,
  ]) => new PresupuestoDetalle(...row));

  return result;
};

export const createNew = async (
  fk_presupuesto: number,
  fk_rol: number,
  horas: number,
  tarifa_hora: number,
) => {
  await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PRESUPUESTO,
      FK_ROL,
      HORAS,
      TARIFA_HORA
    ) VALUES ($1, $2, $3, $4)`,
    fk_presupuesto,
    fk_rol,
    horas,
    tarifa_hora,
  );
};

export const deleteByBudget = async (budget: number): Promise<void> => {
  await postgres.query(
    `DELETE FROM ${TABLE} WHERE FK_PRESUPUESTO = $1`,
    budget,
  );
};
