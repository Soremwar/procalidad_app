import postgres, { queryObject } from "../../services/postgres.ts";
import { BudgetDetail as BudgetDetailInterface } from "../interfaces.ts";
import { TABLE as PLANNING_TABLE } from "../planeacion/recurso.ts";
import { TABLE as ASSIGNATION_TABLE } from "./asignacion.ts";
import { TABLE as REGISTRY_TABLE } from "./registro.ts";

export const TABLE = "OPERACIONES.PRESUPUESTO_DETALLE";

const fields = [
  "budget",
  "role",
  "hours",
  "hour_cost",
  "used",
];

class PresupuestoDetalle {
  constructor(
    public readonly fk_presupuesto: number,
    public readonly fk_rol: number,
    public readonly horas: number,
    public readonly tarifa_hora: number,
  ) {}
}

class BudgetDetail implements BudgetDetailInterface {
  readonly budget: number;
  readonly hour_cost: number;
  readonly hours: number;
  readonly role: number;
  readonly used: boolean;

  constructor(bd: BudgetDetail) {
    this.budget = bd.budget;
    this.hours = bd.hours;
    this.hour_cost = bd.hour_cost;
    this.role = bd.role;
    this.used = bd.used;
  }
}

export const createNew = async ({
  budget,
  hour_cost,
  hours,
  role,
}: BudgetDetailInterface) => {
  await queryObject({
    text: (
      `INSERT INTO ${TABLE} (
        FK_PRESUPUESTO,
        FK_ROL,
        HORAS,
        TARIFA_HORA
      ) VALUES (
        $1,
        $2,
        $3,
        $4
      )`
    ),
    args: [
      budget,
      role,
      hours,
      hour_cost,
    ],
  });

  return new BudgetDetail({
    budget,
    hour_cost,
    hours,
    role,
    used: false,
  });
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

  return rows.map((row: [
    number,
    number,
    number,
    number,
  ]) => new PresupuestoDetalle(...row));
};

export const findUseByBudget = async (
  budget: number,
): Promise<BudgetDetailInterface[]> => {
  const { rows } = await queryObject<BudgetDetailInterface>({
    text: (
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
      LEFT JOIN ${PLANNING_TABLE} P
        ON D.FK_ROL = P.FK_ROL
        AND P.FK_PRESUPUESTO = $1
      LEFT JOIN ${ASSIGNATION_TABLE} A
        ON D.FK_ROL = A.FK_ROL
        AND A.FK_PRESUPUESTO = $1
      LEFT JOIN ${REGISTRY_TABLE} R
        ON D.FK_ROL = R.FK_ROL
        AND R.FK_PRESUPUESTO = $1
      WHERE D.FK_PRESUPUESTO = $1
      GROUP BY
        D.FK_PRESUPUESTO,
        D.FK_ROL,
        D.HORAS,
        D.TARIFA_HORA`
    ),
    args: [budget],
    fields,
  });

  return rows.map((row) => new BudgetDetail(row));
};

export const deleteByBudget = async (budget: number): Promise<void> => {
  await postgres.query(
    `DELETE FROM ${TABLE} WHERE FK_PRESUPUESTO = $1`,
    budget,
  );
};
