import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "USUARIOS.NIVEL_FORMACION";

export enum FormationType {
  "Academica" = "Academica",
  "Continuada" = "Continuada",
  "Capacitaciones" = "Capacitaciones",
}

class FormationLevel {
  constructor(
    public readonly id: number,
    public readonly formation_type: FormationType,
    public name: string,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_NIVEL = $1`,
      this.id,
    );
  }

  async update(
    name: string,
  ) {
    Object.assign(this, {
      name,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2
      WHERE PK_NIVEL = $1`,
      this.id,
      this.name,
    );

    return this;
  }
}

export const create = async (
  formation_type: FormationType,
  name: string,
): Promise<FormationLevel> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      TIPO_FORMACION,
      NOMBRE
    ) VALUES (
      $1,
      $2
    ) RETURNING PK_NIVEL`,
    formation_type,
    name,
  );

  const id: number = rows[0][0];

  return new FormationLevel(
    id,
    formation_type,
    name,
  );
};

//TODO
//Add enum support
export const getAll = async (
  formation_type?: FormationType,
): Promise<FormationLevel[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_NIVEL,
      TIPO_FORMACION::VARCHAR,
      NOMBRE
    FROM ${TABLE}
    ${formation_type ? `WHERE TIPO_FORMACION = '${formation_type}'` : ""}`,
  );

  return rows.map((row: [
    number,
    FormationType,
    string,
  ]) => new FormationLevel(...row));
};

//TODO
//Add enum support
export const findById = async (
  id: number,
): Promise<FormationLevel | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_NIVEL,
      TIPO_FORMACION::VARCHAR,
      NOMBRE
    FROM ${TABLE}
    WHERE PK_NIVEL = $1`,
    id,
  );

  if (!rows.length) return null;

  return new FormationLevel(
    ...rows[0] as [
      number,
      FormationType,
      string,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly formation_type: string,
    public readonly name: string,
  ) {}
}

//TODO
//Add enum support
export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_NIVEL AS ID,
      TIPO_FORMACION::VARCHAR AS FORMATION_TYPE,
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
