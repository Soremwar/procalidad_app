import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "ORGANIZACION.LICENCIA";

//TODO
//Add code constraint for deleting licences in people cost calculations
class Licencia {
  constructor(
    public readonly pk_licencia: number,
    public nombre: string,
    public descripcion: string,
    public costo: number,
  ) {}

  async update(
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
    costo: number = this.costo,
  ): Promise<
    Licencia
  > {
    Object.assign(this, { nombre, descripcion, costo });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3,
        COSTO = $4
      WHERE PK_LICENCIA = $1`,
      this.pk_licencia,
      this.nombre,
      this.descripcion,
      this.costo,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_LICENCIA = $1`,
      this.pk_licencia,
    );
  }
}

export const findAll = async (): Promise<Licencia[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_LICENCIA,
      NOMBRE,
      DESCRIPCION,
      COSTO
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
    number,
  ]) => new Licencia(...row));

  return models;
};

export const findById = async (id: number): Promise<Licencia | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_LICENCIA,
      NOMBRE,
      DESCRIPCION,
      COSTO
    FROM ${TABLE}
    WHERE PK_LICENCIA = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    string,
    number,
  ] = rows[0];
  return new Licencia(...result);
};

export const createNew = async (
  nombre: string,
  descripcion: string,
  costo: number,
): Promise<Licencia> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION,
      COSTO
    ) VALUES ($1, $2, $3)
    RETURNING PK_LICENCIA`,
    nombre,
    descripcion,
    costo,
  );

  const id: number = rows[0][0];

  return new Licencia(id, nombre, descripcion, costo);
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public description: string,
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
      PK_LICENCIA AS ID,
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
