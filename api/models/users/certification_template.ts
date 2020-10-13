import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as PROVIDER_TABLE } from "./certification_provider.ts";

export const TABLE = "USUARIOS.PLANTILLA_CERTIFICACION";

export class Certification {
  constructor(
    public readonly id: number,
    public provider: number,
    public name: string,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_PLANTILLA = $1`,
      this.id,
    );
  }

  static async nameIsTaken(
    name: string,
    exclude?: number,
  ) {
    const { rows } = await postgres.query(
      `SELECT
        COUNT(1)
      FROM ${TABLE}
      WHERE NOMBRE = $1
      AND PK_PLANTILLA <> $2`,
      name,
      exclude || 0,
    );

    return rows[0][0] > 0;
  }

  async update(
    provider = this.provider,
    name = this.name,
  ) {
    Object.assign(this, {
      provider,
      name,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_PROVEEDOR = $2,
        NOMBRE = $3
      WHERE PK_PLANTILLA = $1`,
      this.id,
      this.provider,
      this.name,
    );

    return this;
  }
}

export const create = async (
  provider: number,
  name: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PROVEEDOR,
      NOMBRE
    ) VALUES (
      $1,
      $2
    ) RETURNING PK_PLANTILLA`,
    provider,
    name,
  );

  const id = rows[0][0] as number;

  return new Certification(
    id,
    provider,
    name,
  );
};

export const findById = async (id: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PLANTILLA,
      FK_PROVEEDOR,
      NOMBRE
    FROM ${TABLE}
    WHERE PK_PLANTILLA = $1`,
    id,
  );

  if (!rows.length) return null;

  return new Certification(
    ...rows[0] as [
      number,
      number,
      string,
    ],
  );
};

export const getAll = async () => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PLANTILLA,
      FK_PROVEEDOR,
      NOMBRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
  ]) => new Certification(...row));
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly provider: string,
    public readonly name: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_PLANTILLA AS ID,
      (SELECT NOMBRE FROM ${PROVIDER_TABLE} WHERE PK_PROVEEDOR = FK_PROVEEDOR) AS PROVIDER,
      NOMBRE AS NAME
    FROM ${TABLE}`
  );

  const { count, data } = await getTableModels(
    base_query,
    order,
    page,
    rows,
    filters,
    search,
  );

  const models = data.map((x: [
    number,
    string,
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
