import { queryObject } from "../../services/postgres.ts";
import { LicenceCost as LicenceCostInterface } from "../interfaces.ts";

export const TABLE = "ORGANIZACION.LICENCIA_COSTO";

const fields = [
  "id",
  "licence",
  "start_date",
  "end_date",
  "cost",
];

class LicenceCost implements LicenceCostInterface {
  readonly licence: number;
  cost: number;
  end_date: string | null;
  readonly id: number;
  start_date: string;

  constructor(license: LicenceCostInterface) {
    this.licence = license.licence;
    this.cost = license.cost;
    this.end_date = license.end_date;
    this.id = license.id;
    this.start_date = license.start_date;
  }

  async update({
    cost = this.cost,
    end_date = this.end_date,
    start_date = this.start_date,
  }: LicenceCostInterface) {
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
  licence,
  cost,
  end_date,
  start_date,
}: LicenceCostInterface) => {
  const { rows } = await queryObject<{ id: number }>({
    text: (
      `INSERT INTO ${TABLE} (
        FK_LICENCIA,
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
      licence,
      start_date,
      end_date,
      cost,
    ],
  });

  return new LicenceCost({
    licence,
    cost,
    end_date,
    id: rows[0].id,
    start_date,
  });
};

export const findByLicence = async (licence: number) => {
  const { rows } = await queryObject<LicenceCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_LICENCIA,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
        COSTO
      FROM ${TABLE}
      WHERE FK_LICENCIA = $1`
    ),
    args: [
      licence,
    ],
    fields,
  });

  return rows.map((row) => new LicenceCost(row));
};

export const findById = async (licence: number) => {
  const { rows } = await queryObject<LicenceCostInterface>({
    text: (
      `SELECT
        PK_COSTO,
        FK_LICENCIA,
        TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
        TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
        COSTO
      FROM ${TABLE}
      WHERE PK_COSTO = $1`
    ),
    args: [
      licence,
    ],
    fields,
  });

  if (!rows.length) {
    return null;
  }

  return new LicenceCost(rows[0]);
};
