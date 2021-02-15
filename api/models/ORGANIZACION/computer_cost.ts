import { queryObject } from "../../services/postgres.ts";
import { ComputerCost as ComputerCostInterface } from "../interfaces.ts";

const TABLE = "ORGANIZACION.COMPUTADOR_COSTO";

const fields = [
  "id",
  "computer",
  "start_date",
  "end_date",
  "cost",
];

class ComputerCost implements ComputerCostInterface {
  readonly computer: number;
  cost: number;
  end_date: string | null;
  readonly id: number;
  start_date: string;

  constructor(computer_cost: ComputerCostInterface) {
    this.computer = computer_cost.computer;
    this.cost = computer_cost.cost;
    this.end_date = computer_cost.end_date;
    this.id = computer_cost.id;
    this.start_date = computer_cost.start_date;
  }

  async update({
    cost = this.cost,
    end_date = this.end_date,
    start_date = this.start_date,
  }: ComputerCostInterface) {
    Object.assign(this, {
      cost,
      end_date,
      start_date,
    });

    await queryObject({
      text: (
        `UPDATE ${TABLE} SET
          FEC_INICIO = $2,
          FEC_FIN = $3,
          COSTO = $4
        WHERE PK_COSTO = $1`
      ),
      args: [
        this.id,
        this.start_date,
        this.end_date,
        this.cost,
      ],
    });

    return this;
  }

  async delete() {
    await queryObject({
      text: `DELETE FROM ${TABLE} WHERE PK_COSTO = $1`,
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
  start_date,
}: ComputerCostInterface) => {
  const { rows } = await queryObject<{ id: number }>({
    text: (
      `INSERT INTO ${TABLE} (
        FK_COMPUTADOR,
        FEC_INICIO,
        FEC_FIN,
        COSTO
      ) VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING
        PK_COSTO`
    ),
    fields: ["id"],
    args: [
      computer,
      start_date,
      end_date,
      cost,
    ],
  });

  return new ComputerCost({
    computer,
    cost,
    end_date,
    id: rows[0].id,
    start_date,
  });
};

export const findByComputer = async (computer: number) => {
  const { rows } = await queryObject<ComputerCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_COMPUTADOR,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
        COSTO
      FROM ${TABLE}
      WHERE FK_COMPUTADOR = $1`
    ),
    args: [
      computer,
    ],
    fields,
  });

  return rows.map((row) => new ComputerCost(row));
};

export const findById = async (computer: number) => {
  const { rows } = await queryObject<ComputerCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_COMPUTADOR,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
        COSTO
      FROM ${TABLE}
      WHERE PK_COSTO = $1`
    ),
    args: [
      computer,
    ],
    fields,
  });

  if (!rows.length) {
    return null;
  }

  return new ComputerCost(rows[0]);
};
