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
  "direct_cost",
  "third_party_cost",
  "unforeseen_cost",
  "productivity_percentage",
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
  readonly direct_cost: number;
  readonly hour_cost: number;
  readonly hours: number;
  readonly productivity_percentage: number;
  readonly role: number;
  readonly third_party_cost: number;
  readonly unforeseen_cost: number;
  readonly used: boolean;

  constructor(bd: BudgetDetail) {
    this.budget = bd.budget;
    this.direct_cost = bd.direct_cost;
    this.hours = bd.hours;
    this.hour_cost = bd.hour_cost;
    this.productivity_percentage = bd.productivity_percentage;
    this.role = bd.role;
    this.third_party_cost = bd.third_party_cost;
    this.unforeseen_cost = bd.unforeseen_cost;
    this.used = bd.used;
  }
}

export const createNew = async ({
  budget,
  direct_cost,
  hour_cost,
  hours,
  productivity_percentage,
  role,
  third_party_cost,
  unforeseen_cost,
}: BudgetDetailInterface) => {
  await queryObject({
    text: (
      `INSERT INTO ${TABLE} (
        FK_PRESUPUESTO,
        FK_ROL,
        HORAS,
        COSTO_DIRECTO,
        COSTO_TERCEROS,
        COSTO_IMPREVISTO,
        FACTOR_PRODUCTIVIDAD,
        TARIFA_HORA
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )`
    ),
    args: [
      budget,
      role,
      hours,
      direct_cost,
      third_party_cost,
      unforeseen_cost,
      productivity_percentage,
      hour_cost,
    ],
  });

  return new BudgetDetail({
    budget,
    direct_cost,
    hour_cost,
    hours,
    productivity_percentage,
    role,
    third_party_cost,
    unforeseen_cost,
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
  const result = rows.map((row: [
    number,
    number,
    number,
    number,
  ]) => new PresupuestoDetalle(...row));

  return result;
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
        D.COSTO_DIRECTO,
        D.COSTO_TERCEROS,
        D.COSTO_IMPREVISTO,
        D.FACTOR_PRODUCTIVIDAD,
        D.TARIFA_HORA,
        CASE
          WHEN (COUNT(P.FK_ROL) + COUNT(A.FK_ROL) + COUNT(R.FK_ROL)) > 0
          THEN TRUE
          ELSE FALSE
        END
      FROM ${TABLE} D
      LEFT JOIN ${PLANNING_TABLE} P
        ON D.FK_ROL = P.FK_ROL
      LEFT JOIN ${ASSIGNATION_TABLE} A
        ON D.FK_ROL = A.FK_ROL
      LEFT JOIN ${REGISTRY_TABLE} R
        ON D.FK_ROL = R.FK_ROL
      WHERE D.FK_PRESUPUESTO = $1
      GROUP BY
        D.FK_PRESUPUESTO,
        D.FK_ROL,
        D.HORAS,
        D.COSTO_DIRECTO,
        D.COSTO_TERCEROS,
        D.COSTO_IMPREVISTO,
        D.FACTOR_PRODUCTIVIDAD,
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
