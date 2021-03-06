import { queryObject } from "../../services/postgres.ts";
import { encryption_key } from "../../../config/services/postgresql.ts";
import { ExternalCost as ExternalCostInterface } from "../interfaces.ts";
import { CostType } from "../enums.ts";

export const TABLE = "ORGANIZACION.COSTO_EXTERNO";

const fields = [
  "id",
  "person",
  "type",
  "computer",
  "licenses",
  "other_costs",
  "start_date",
  "end_date",
  "cost",
];

class ExternalCost implements ExternalCostInterface {
  computer: number;
  cost: number;
  end_date: string;
  licenses: number[];
  other_costs: number;
  readonly id: number;
  readonly person: number;
  start_date: string;
  type: CostType;

  constructor(monthly_cost: ExternalCostInterface) {
    this.computer = monthly_cost.computer;
    this.cost = monthly_cost.cost;
    this.end_date = monthly_cost.end_date;
    this.id = monthly_cost.id;
    this.licenses = monthly_cost.licenses;
    this.other_costs = monthly_cost.other_costs;
    this.person = monthly_cost.person;
    this.start_date = monthly_cost.start_date;
    this.type = monthly_cost.type;
  }

  async update({
    computer,
    cost,
    end_date,
    licenses,
    other_costs,
    start_date,
    type,
  }: ExternalCostInterface) {
    Object.assign(this, {
      computer,
      cost,
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
          LICENCIAS = '{${this.licenses.join(",")}}',
          OTROS = PGP_SYM_ENCRYPT($4, $8),
          FEC_INICIO = $5,
          FEC_FIN = $6,
          COSTO = PGP_SYM_ENCRYPT($7, $8)
        WHERE PK_COSTO = $1`
      ),
      args: [
        this.id,
        this.type,
        this.computer,
        this.other_costs,
        this.start_date,
        this.end_date,
        this.cost,
        encryption_key,
      ],
    });

    return this;
  }

  async delete() {
    await queryObject({
      text: (
        `DELETE FROM ${TABLE} WHERE PK_COSTO = $1`
      ),
      args: [
        this.id,
      ],
    });
  }
}

export const create = async ({
  computer,
  cost,
  end_date,
  licenses,
  other_costs,
  person,
  start_date,
  type,
}: ExternalCostInterface) => {
  const { rows } = await queryObject<{ id: number }>({
    text: (
      `INSERT INTO ${TABLE} (
        FK_PERSONA,
        TIPO_COSTO,
        FK_COMPUTADOR,
        LICENCIAS,
        OTROS,
        FEC_INICIO,
        FEC_FIN,
        COSTO
      ) VALUES (
        $1,
        $2,
        $3,
        '{${licenses.join(",")}}',
        PGP_SYM_ENCRYPT($4, $8),
        $5,
        $6,
        PGP_SYM_ENCRYPT($7, $8)
      )
      RETURNING
        PK_COSTO`
    ),
    args: [
      person,
      type,
      computer,
      other_costs,
      start_date,
      end_date,
      cost,
      encryption_key,
    ],
    fields: ["id"],
  });

  return new ExternalCost({
    computer,
    cost,
    end_date,
    id: rows[0].id,
    licenses,
    other_costs,
    person,
    start_date,
    type,
  });
};

export const findById = async (id: number): Promise<ExternalCost | null> => {
  const { rows } = await queryObject<ExternalCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_PERSONA,
        TIPO_COSTO,
        FK_COMPUTADOR,
        LICENCIAS,
        CASE WHEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2)::INTEGER ELSE 0 END,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
        CASE WHEN PGP_SYM_DECRYPT(COSTO::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(COSTO::BYTEA, $2)::INTEGER ELSE 0 END
      FROM ${TABLE}
      WHERE PK_COSTO = $1`
    ),
    args: [
      id,
      encryption_key,
    ],
    fields,
  });

  if (!rows.length) {
    return null;
  }

  return new ExternalCost(rows[0]);
};

export const findByPerson = async (person: number): Promise<ExternalCost[]> => {
  const { rows } = await queryObject<ExternalCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_PERSONA,
        TIPO_COSTO,
        FK_COMPUTADOR,
        LICENCIAS,
        CASE WHEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(OTROS::BYTEA, $2)::INTEGER ELSE 0 END,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
        CASE WHEN PGP_SYM_DECRYPT(COSTO::BYTEA, $2) ~ '^[0-9]+$' THEN PGP_SYM_DECRYPT(COSTO::BYTEA, $2)::INTEGER ELSE 0 END
      FROM ${TABLE}
      WHERE FK_PERSONA = $1`
    ),
    args: [
      person,
      encryption_key,
    ],
    fields,
  });

  return rows.map((row) => new ExternalCost(row));
};
