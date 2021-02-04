import postgres from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "USUARIOS.TIPO_CERTIFICACION";

export class CertificationType {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_TIPO = $1`,
      this.id,
    );
  }

  getCode() {
    return this.name.slice(0, 3);
  }

  /**
   * This only validates the first three caracters passed to it.
   * The certification type uses only this three characters for its storage
   * @param {string} name Will be trimmed to the first three characters
   * */
  static async nameIsTaken(
    name: string,
    exclude?: number,
  ) {
    const { rows } = await postgres.query(
      `SELECT
        COUNT(1)
      FROM ${TABLE}
      WHERE SUBSTRING(NOMBRE, 0, 4) = $1
      AND PK_TIPO <> $2`,
      name.slice(0, 3),
      exclude || 0,
    );

    return rows[0][0] > 0;
  }

  async update(
    name = this.name,
    description = this.description,
  ) {
    Object.assign(this, {
      name,
      description,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3
      WHERE PK_TIPO = $1`,
      this.id,
      this.name,
      this.description,
    );

    return this;
  }
}

export const create = async (
  name: string,
  description: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION
    ) VALUES (
      $1,
      $2
    ) RETURNING PK_TIPO`,
    name,
    description,
  );

  const id = rows[0][0] as number;

  return new CertificationType(
    id,
    name,
    description,
  );
};

export const findById = async (id: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_TIPO,
      NOMBRE,
      DESCRIPCION
    FROM ${TABLE}
    WHERE PK_TIPO = $1`,
    id,
  );

  if (!rows.length) return null;

  return new CertificationType(
    ...rows[0] as [
      number,
      string,
      string,
    ],
  );
};

export const getAll = async () => {
  const { rows } = await postgres.query(
    `SELECT
      PK_TIPO,
      NOMBRE,
      DESCRIPCION
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
    string,
  ]) => new CertificationType(...row));
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
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
      PK_TIPO AS ID,
      NOMBRE AS NAME,
      DESCRIPCION AS DESCRIPTION
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
