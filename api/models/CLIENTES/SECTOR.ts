import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder, getTableModels, TableResult,
} from "../../common/table.ts";

export const TABLE = "CLIENTES.SECTOR";

const ERROR_DEPENDENCY =
  "No se puede eliminar el sector por que hay componentes que dependen de el";

class Sector {
  constructor(
    public readonly pk_sector: number,
    public nombre: string,
  ) {}

  async update(
    nombre: string = this.nombre,
  ): Promise<
    Sector
  > {
    Object.assign(this, { nombre });
    await postgres.query(
      "UPDATE CLIENTES.SECTOR SET NOMBRE = $2 WHERE PK_SECTOR = $1",
      this.pk_sector,
      this.nombre,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM CLIENTES.SECTOR WHERE PK_SECTOR = $1",
      this.pk_sector,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Sector[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_SECTOR, NOMBRE FROM CLIENTES.SECTOR",
  );
  const models = rows.map((row: [number, string]) => new Sector(...row));

  return models;
};

export const findById = async (id: number): Promise<Sector | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_SECTOR, NOMBRE FROM CLIENTES.SECTOR WHERE PK_SECTOR = $1",
    id,
  );
  if (!rows[0]) return null;
  const result: [number, string] = rows[0];
  return new Sector(...result);
};

export const createNew = async (nombre: string) => {
  await postgres.query(
    "INSERT INTO CLIENTES.SECTOR (NOMBRE) VALUES ($1)",
    nombre,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: {[key: string]: string},
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_SECTOR AS ID,
      NOMBRE AS NAME
    FROM CLIENTES.SECTOR`
  );

  const { count, data } = await getTableModels(
    base_query,
    order,
    page,
    rows,
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
