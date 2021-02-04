import postgres from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "USUARIOS.PROVEEDOR_CERTIFICACION";

export class CertificationProvider {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_PROVEEDOR = $1`,
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
      AND PK_PROVEEDOR <> $2`,
      name,
      exclude || 0,
    );

    return rows[0][0] > 0;
  }

  async update(
    name = this.name,
  ) {
    Object.assign(this, {
      name,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2
      WHERE PK_PROVEEDOR = $1`,
      this.id,
      this.name,
    );

    return this;
  }
}

export const create = async (
  name: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE
    ) VALUES (
      $1
    ) RETURNING PK_PROVEEDOR`,
    name,
  );

  const id = rows[0][0] as number;

  return new CertificationProvider(
    id,
    name,
  );
};

export const findById = async (id: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PROVEEDOR,
      NOMBRE
    FROM ${TABLE}
    WHERE PK_PROVEEDOR = $1`,
    id,
  );

  if (!rows.length) return null;

  return new CertificationProvider(
    ...rows[0] as [
      number,
      string,
    ],
  );
};

export const getAll = async () => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PROVEEDOR,
      NOMBRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
  ]) => new CertificationProvider(...row));
};

class TableData {
  constructor(
    public readonly id: number,
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
      PK_PROVEEDOR AS ID,
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
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
