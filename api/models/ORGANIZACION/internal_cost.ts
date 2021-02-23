import { queryObject } from "../../services/postgres.ts";
import { encryption_key } from "../../../config/services/postgresql.ts";
import { TABLE as LICENCE_COST_TABLE } from "./licence_cost.ts";
import { TABLE as COMPUTER_COST_TABLE } from "./computer_cost.ts";
import { TABLE as PARAMETER_TABLE } from "../MAESTRO/parametro.ts";
import { TABLE as PARAMETER_DEFINITION_TABLE } from "../MAESTRO/parametro_definicion.ts";
import { InternalCostType } from "../enums.ts";
import {
  InternalCost as InternalCostInterface,
  InternalCostCalculation,
} from "../interfaces.ts";

export const TABLE = "ORGANIZACION.COSTO_INTERNO";

const fields = [
  "id",
  "person",
  "type",
  "computer",
  "licenses",
  "base_cost",
  "bonus_cost",
  "other_costs",
  "start_date",
  "end_date",
];

class InternalCost implements InternalCostInterface {
  base_cost: number;
  bonus_cost: number;
  computer: number;
  end_date: string | null;
  readonly id: number;
  licenses: number[];
  other_costs: number;
  readonly person: number;
  start_date: string;
  type: InternalCostType;

  constructor(internal_cost: InternalCostInterface) {
    this.base_cost = internal_cost.base_cost;
    this.bonus_cost = internal_cost.bonus_cost;
    this.computer = internal_cost.computer;
    this.end_date = internal_cost.end_date;
    this.id = internal_cost.id;
    this.licenses = internal_cost.licenses;
    this.other_costs = internal_cost.other_costs;
    this.person = internal_cost.person;
    this.start_date = internal_cost.start_date;
    this.type = internal_cost.type;
  }

  async update({
    base_cost = this.base_cost,
    bonus_cost = this.bonus_cost,
    computer = this.computer,
    end_date = this.end_date,
    licenses = this.licenses,
    other_costs = this.other_costs,
    start_date = this.start_date,
    type = this.type,
  }: InternalCostInterface): Promise<InternalCost> {
    Object.assign(this, {
      base_cost,
      bonus_cost,
      computer,
      end_date,
      licenses,
      other_costs,
      start_date,
      type,
    });

    await queryObject({
      text: (
        `UPDATE ${TABLE} SET
          TIPO_COSTO = $2,
          FK_COMPUTADOR = $3,
          LICENCIAS = '{${licenses.join(",")}}',
          VALOR_PRESTACIONAL = PGP_SYM_ENCRYPT($4, $9),
          VALOR_BONOS = PGP_SYM_ENCRYPT($5, $9),
          OTROS = PGP_SYM_ENCRYPT($6, $9),
          FEC_INICIO = $7,
          FEC_FIN = $8
        WHERE PK_COSTO = $1`
      ),
      args: [
        this.id,
        this.type,
        this.computer,
        this.base_cost,
        this.bonus_cost,
        this.other_costs,
        this.start_date,
        this.end_date,
        encryption_key,
      ],
    });

    return this;
  }

  async delete(): Promise<void> {
    await queryObject({
      text: `DELETE FROM ${TABLE} WHERE PK_COSTO = $1`,
      args: [this.id],
    });
  }
}

export const create = async ({
  base_cost,
  bonus_cost,
  computer,
  end_date,
  licenses,
  other_costs,
  person,
  start_date,
  type,
}: InternalCostInterface): Promise<InternalCost> => {
  const { rows } = await queryObject<{ id: number }>({
    text: (
      `INSERT INTO ${TABLE} (
        FK_PERSONA,
        TIPO_COSTO,
        FK_COMPUTADOR,
        LICENCIAS,
        VALOR_PRESTACIONAL,
        VALOR_BONOS,
        OTROS,
        FEC_INICIO,
        FEC_FIN
      ) VALUES (
        $1,
        $2,
        $3,
        '{${licenses.join(",")}}',
        PGP_SYM_ENCRYPT($4::VARCHAR, $9),
        PGP_SYM_ENCRYPT($5::VARCHAR, $9),
        PGP_SYM_ENCRYPT($6::VARCHAR, $9),
        $7,
        $8
      )
      RETURNING
        PK_COSTO`
    ),
    args: [
      person,
      type,
      computer,
      base_cost,
      bonus_cost,
      other_costs,
      start_date,
      end_date,
      encryption_key,
    ],
    fields: ["id"],
  });

  return new InternalCost({
    id: rows[0].id,
    person,
    type,
    computer,
    licenses,
    base_cost,
    bonus_cost,
    other_costs,
    start_date,
    end_date,
  });
};

export const getCalculatedResult = async ({
  base_cost,
  bonus_cost,
  computer,
  licenses,
  other_costs,
  type,
}: {
  base_cost: number;
  bonus_cost: number;
  computer: number;
  licenses: number[];
  other_costs: number;
  type: InternalCostType;
}) => {
  const { rows } = await queryObject<InternalCostCalculation>({
    text: (
      // deno-fmt-ignore
      `WITH PARAMETROS AS (
        SELECT
          SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_SMMLV' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_SMMLV,
          SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Porc_Parafiscales' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_PORC_PARAFISCALES,
          SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Factor_Integral' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_FACTOR_INTEGRAL,
          SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Aux_Transporte' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_AUX_TRANSPORTE,
          SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Bono_Dotacion_Cuatrimestral' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_BONO_DOTACION_CUATRIMESTRAL
        FROM ${PARAMETER_TABLE} AS PAR
        JOIN ${PARAMETER_DEFINITION_TABLE} AS DEF
        ON PAR.PK_PARAMETRO = DEF.FK_PARAMETRO
        WHERE CURRENT_DATE BETWEEN DEF.FEC_INICIO AND DEF.FEC_FIN
      ),
      COSTOS AS (
        SELECT
          CAST($1 AS NUMERIC) AS VALOR_PRESTACIONAL,
          CAST($2 AS NUMERIC) AS VALOR_BONOS,
          ${
            licenses.length
              ? `(
                  SELECT
                    COALESCE(SUM(COSTO), 0)
                  FROM ${LICENCE_COST_TABLE}
                  WHERE FK_LICENCIA IN (${licenses.join(",")})
                  AND CURRENT_DATE BETWEEN FEC_INICIO AND COALESCE(FEC_FIN, CURRENT_DATE)
                )`
              : `0`
          } AS LICENCIAS,
          CAST($3 AS NUMERIC) AS OTROS,
          $4 AS TIPO_SALARIO
      ),
      COSTO_COMPUTADOR AS (
        SELECT
          SUM(COSTO) AS COSTO
        FROM (
          SELECT
            COSTO
          FROM ${COMPUTER_COST_TABLE}
          WHERE FK_COMPUTADOR = $5
          AND CURRENT_DATE BETWEEN FEC_INICIO AND COALESCE(FEC_FIN, CURRENT_DATE)
          -- Append union all so that cost can be coalesced when no date range matches
          -- or no computer cost has been defined
          UNION ALL
          SELECT 0 AS COSTO
        ) A
      ),
      COSTO_EMPLEADO AS (
        SELECT
          CASE
            WHEN PAR.V_SMMLV * 2 > COSTOS.VALOR_PRESTACIONAL
              THEN (COSTOS.VALOR_PRESTACIONAL * (1 + (PAR.V_PORC_PARAFISCALES / 100))) + PAR.V_AUX_TRANSPORTE + (PAR.V_BONO_DOTACION_CUATRIMESTRAL / 4) + COSTOS.VALOR_BONOS + COSTOS.OTROS
            WHEN COSTOS.TIPO_SALARIO = 'ORDINARIO'
              THEN (COSTOS.VALOR_PRESTACIONAL * (1 + (PAR.V_PORC_PARAFISCALES / 100))) + COSTOS.VALOR_BONOS + COSTOS.OTROS
            ELSE
              (((COSTOS.VALOR_PRESTACIONAL * (PAR.V_FACTOR_INTEGRAL / 100))) * (1 + (PAR.V_PORC_PARAFISCALES / 100))) + COSTOS.VALOR_BONOS + COSTOS.OTROS + (COSTOS.VALOR_PRESTACIONAL * (1 - (PAR.V_FACTOR_INTEGRAL / 100)))
          END AS COSTO
        FROM COSTOS
        JOIN PARAMETROS AS PAR ON 1 = 1
      )
      SELECT
        CAST(COSTO AS INTEGER) AS COSTO,
        CAST(COSTO + COSTOS.LICENCIAS + (SELECT COSTO FROM COSTO_COMPUTADOR) AS INTEGER) AS COSTO_TOTAL
      FROM COSTO_EMPLEADO
      JOIN COSTOS ON 1 = 1`
    ),
    args: [
      base_cost,
      bonus_cost,
      other_costs,
      type,
      computer,
    ],
    fields: ["base_cost", "total_cost"],
  });

  if (rows.length !== 1) {
    return null;
  }

  return rows[0];
};

export const findById = async (id: number): Promise<InternalCost | null> => {
  const { rows } = await queryObject<InternalCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_PERSONA,
        TIPO_COSTO,
        FK_COMPUTADOR,
        LICENCIAS,
        CASE WHEN PGP_SYM_DECRYPT(VALOR_PRESTACIONAL::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(VALOR_PRESTACIONAL::BYTEA, $2)::INTEGER ELSE 0 END,
        CASE WHEN PGP_SYM_DECRYPT(VALOR_BONOS::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(VALOR_BONOS::BYTEA, $2)::INTEGER ELSE 0 END,
        CASE WHEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2)::INTEGER ELSE 0 END,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD')
      FROM ${TABLE}
      WHERE PK_COSTO = $1`
    ),
    args: [id, encryption_key],
    fields,
  });

  if (!rows[0]) return null;

  return new InternalCost(rows[0]);
};

export const findByPerson = async (
  person: number,
): Promise<InternalCost[]> => {
  const { rows } = await queryObject<InternalCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_PERSONA,
        TIPO_COSTO,
        FK_COMPUTADOR,
        LICENCIAS,
        CASE WHEN PGP_SYM_DECRYPT(VALOR_PRESTACIONAL::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(VALOR_PRESTACIONAL::BYTEA, $2)::INTEGER ELSE 0 END,
        CASE WHEN PGP_SYM_DECRYPT(VALOR_BONOS::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(VALOR_BONOS::BYTEA, $2)::INTEGER ELSE 0 END,
        CASE WHEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2)::INTEGER ELSE 0 END,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD')
      FROM ${TABLE}
      WHERE FK_PERSONA = $1`
    ),
    args: [person, encryption_key],
    fields,
  });

  return rows.map((row) => new InternalCost(row));
};
