import postgres from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "MAESTRO.IDIOMA";

class Language {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}

  async update(
    name: string,
  ): Promise<Language> {
    Object.assign(this, {
      name,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2
        WHERE PK_IDIOMA = $1`,
      this.id,
      this.name,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
        WHERE PK_IDIOMA = $1`,
      this.id,
    );
  }
}

export const create = async (
  name: string,
): Promise<Language> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
        NOMBRE
      ) VALUES (
        $1
      ) RETURNING PK_IDIOMA`,
    name,
  );

  const id: number = rows[0][0];

  return new Language(
    id,
    name,
  );
};

export const getAll = async (): Promise<Language[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_IDIOMA,
      NOMBRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
  ]) => new Language(...row));
};

export const findById = async (
  id: number,
): Promise<Language | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_IDIOMA,
      NOMBRE
    FROM ${TABLE}
    WHERE PK_IDIOMA = $1`,
    id,
  );

  if (!rows.length) return null;

  return new Language(
    ...rows[0] as [
      number,
      string,
    ],
  );
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
        PK_IDIOMA AS ID,
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
