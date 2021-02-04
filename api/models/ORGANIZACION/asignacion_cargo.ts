import postgres from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "ORGANIZACION.ASIGNACION_CARGO";

class AsignacionCargo {
  constructor(
    public readonly pk_asignacion: number,
    public readonly fk_persona: number,
    public fk_sub_area: number,
    public fk_cargo: number,
    public fk_roles: number[],
    public fec_vigencia: Date,
  ) {}

  async update(
    fk_sub_area: number = this.fk_sub_area,
    fk_cargo: number = this.fk_cargo,
    fk_roles: number[] = this.fk_roles,
    fec_vigencia: Date = this.fec_vigencia,
  ): Promise<AsignacionCargo> {
    Object.assign(this, {
      fk_sub_area,
      fk_cargo,
      fk_roles,
      fec_vigencia,
    });
    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_SUB_AREA = $2,
        FK_CARGO = $3,
        FK_ROLES = '{${this.fk_roles.join(",")}}',
        FEC_VIGENCIA = $4
      WHERE PK_ASIGNACION = $1`,
      this.pk_asignacion,
      this.fk_sub_area,
      this.fk_cargo,
      this.fec_vigencia,
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
      ARRAY_TO_STRING(FK_ROLES, ','),
      FEC_VIGENCIA
    FROM ${TABLE}`,
  );

  return rows.map(([
    a,
    b,
    c,
    d,
    e,
    f,
  ]: [
    number,
    number,
    number,
    number,
    string,
    Date,
  ]) =>
    new AsignacionCargo(
      a,
      b,
      c,
      d,
      e.split(",").map(Number).filter(Boolean),
      f,
    )
  );
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
      ARRAY_TO_STRING(FK_ROLES, ','),
      FEC_VIGENCIA
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
    f,
  ]: [
    number,
    number,
    number,
    number,
    string,
    Date,
  ] = rows[0];

  return new AsignacionCargo(
    a,
    b,
    c,
    d,
    e.split(",").map(Number).filter(Boolean),
    f,
  );
};

export const createNew = async (
  fk_persona: number,
  fk_sub_area: number,
  fk_cargo: number,
  fk_roles: number[],
  fec_vigencia: Date,
): Promise<AsignacionCargo> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SUB_AREA,
      FK_CARGO,
      FK_ROLES,
      FEC_VIGENCIA
    ) VALUES (
      $1,
      $2,
      $3,
      '{${fk_roles.join(",")}}',
      $4
    ) RETURNING PK_ASIGNACION`,
    fk_persona,
    fk_sub_area,
    fk_cargo,
    fec_vigencia,
  );

  const id: number = rows[0][0];

  return new AsignacionCargo(
    id,
    fk_persona,
    fk_sub_area,
    fk_cargo,
    fk_roles,
    fec_vigencia,
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
      PK_ASIGNACION AS ID,
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ORGANIZACION.SUB_AREA WHERE PK_SUB_AREA = FK_SUB_AREA) AS SUB_AREA,
      (SELECT NOMBRE FROM ORGANIZACION.CARGO WHERE PK_CARGO = FK_CARGO) AS POSITION
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
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
