import postgres from "../../services/postgres.ts";

export const TABLE = "OPERACIONES.PRESUPUESTO_DETALLE";

class PresupuestoDetalle {
  constructor(
    public readonly fk_presupuesto: number,
    public readonly fk_rol: number,
    public readonly horas: number,
    public readonly tarifa_hora: number,
  ) {}
}

class BudgetDetailUse {
  constructor(
    public readonly budget: number,
    public readonly role: number,
    public readonly hours: number,
    public readonly hour_cost: number,
    public readonly used: boolean,
  ) {}
}

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

export const findUseByBudget = async (budget: number) => {
  const { rows } = await postgres.query(
    `SELECT
      D.FK_PRESUPUESTO,
      D.FK_ROL,
      D.HORAS,
      D.TARIFA_HORA,
      CASE
        WHEN (COUNT(P.FK_ROL) + COUNT(A.FK_ROL) + COUNT(R.FK_ROL)) > 0
        THEN TRUE
        ELSE FALSE
      END
    FROM ${TABLE} D
    LEFT JOIN PLANEACION.RECURSO P
      ON D.FK_ROL = P.FK_ROL
    LEFT JOIN OPERACIONES.ASIGNACION A
      ON D.FK_ROL = A.FK_ROL
    LEFT JOIN OPERACIONES.REGISTRO R
      ON D.FK_ROL = R.FK_ROL
    WHERE D.FK_PRESUPUESTO = $1
    GROUP BY
      D.FK_PRESUPUESTO,
      D.FK_ROL,
      D.HORAS,
      D.TARIFA_HORA`,
    budget,
  );

  return rows.map((row: [
    number,
    number,
    number,
    number,
    boolean,
  ]) => new BudgetDetailUse(...row));
};

export const deleteByBudget = async (budget: number): Promise<void> => {
  await postgres.query(
    `DELETE FROM ${TABLE} WHERE FK_PRESUPUESTO = $1`,
    budget,
  );
};
