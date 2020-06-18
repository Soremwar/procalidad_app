import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const TABLE = "ORGANIZACION.ASIGNACION_CARGO";

class AsignacionCargo {
  constructor(
    public readonly pk_asignacion: number,
    public readonly fk_persona: number,
    public fk_sub_area: number,
    public fk_cargo: number,
    public fk_roles: number[],
  ) { }

  async update(
    fk_sub_area: number = this.fk_sub_area,
    fk_cargo: number = this.fk_cargo,
    fk_roles: number[] = this.fk_roles,
  ): Promise<AsignacionCargo> {
    Object.assign(this, {
      fk_sub_area,
      fk_cargo,
      fk_roles,
    });
    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_SUB_AREA = $2,
        FK_CARGO = $3,
        FK_ROLES = '{${this.fk_roles.join(',')}}'
      WHERE PK_ASIGNACION = $1`,
      this.pk_asignacion,
      this.fk_sub_area,
      this.fk_cargo,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_ASIGNACION = $1`,
      this.pk_asignacion,
    );
  }
}

//TODO
//Remove array_to_string and array parse of the values
//(Waiting on Deno update)
export const findAll = async (): Promise<AsignacionCargo[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_SUB_AREA,
      FK_CARGO,
      ARRAY_TO_STRING(FK_ROLES, ',')
    FROM ${TABLE}`,
  );

  return rows.map(([
    a,
    b,
    c,
    d,
    e,
  ]: [
    number,
    number,
    number,
    number,
    string,
  ]) => new AsignacionCargo(
    a,
    b,
    c,
    d,
    e.split(',').map(Number).filter(Boolean),
  ));
};

//TODO
//Remove array_to_string and array parse of the values
//(Waiting on Deno update)
export const findById = async (id: number): Promise<AsignacionCargo | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_SUB_AREA,
      FK_CARGO,
      ARRAY_TO_STRING(FK_ROLES, ',')
    FROM ${TABLE}
    WHERE PK_ASIGNACION = $1`,
    id,
  );

  if (!rows[0]) return null;

  const [
    a,
    b,
    c,
    d,
    e,
  ]: [
    number,
    number,
    number,
    number,
    string,
  ] = rows[0];

  return new AsignacionCargo(
    a,
    b,
    c,
    d,
    e.split(',').map(Number).filter(Boolean),
  );
};

export const createNew = async (
  fk_persona: number,
  fk_sub_area: number,
  fk_cargo: number,
  fk_roles: number[],
): Promise<AsignacionCargo> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SUB_AREA,
      FK_CARGO,
      FK_ROLES
    ) VALUES (
      $1,
      $2,
      $3,
      '{${fk_roles.join(',')}}'
    ) RETURNING PK_ASIGNACION`,
    fk_persona,
    fk_sub_area,
    fk_cargo,
  );

  const id: number = rows[0][0];

  return new AsignacionCargo(
    id,
    fk_persona,
    fk_sub_area,
    fk_cargo,
    fk_roles,
  );
};

export const isPersonAssigned = async (person: number): Promise<boolean> => {
  const { rows } = await postgres.query(
    `SELECT
      1
    FROM
      ${TABLE}
    WHERE
      FK_PERSONA = $1`,
    person,
  );

  return Boolean(rows.length);
};

class TableData {
  constructor(
    public id: number,
    public person: string,
    public sub_area: string,
    public position: string,
  ) { }
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: string,
): Promise<TableData[]> => {
  //TODO
  //Replace search string with search object passed from the frontend table definition

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (
    SELECT
      PK_ASIGNACION AS ID,
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ORGANIZACION.SUB_AREA WHERE PK_SUB_AREA = FK_SUB_AREA) AS SUB_AREA,
      (SELECT NOMBRE FROM ORGANIZACION.CARGO WHERE PK_CARGO = FK_CARGO) AS POSITION
    FROM ${TABLE}
  ) AS TOTAL
    WHERE
      UNACCENT(PERSON) ILIKE '%${search}%' OR
      UNACCENT(SUB_AREA) ILIKE '%${search}%' OR
      UNACCENT(POSITION) ILIKE '%${search}%'`
    " " +
    (Object.values(order).length
      ? `ORDER BY ${Object.entries(order).map(([column, order]) =>
        `${column} ${order}`
      ).join(", ")}`
      : "") +
    " " +
    (rows ? `OFFSET ${rows * page} LIMIT ${rows}` : "");

  const { rows: result } = await postgres.query(query);

  const models = result.map((x: [
    number,
    string,
    string,
    string,
  ]) => new TableData(...x));

  return models;
};
