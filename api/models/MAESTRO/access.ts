import postgres from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as PROFILE_TABLE } from "./profile.ts";
import { TABLE as PEOPLE_TABLE } from "../ORGANIZACION/people.ts";

export const TABLE = "MAESTRO.ACCESO";

class Access {
  constructor(
    public readonly person: number,
    public profiles: number[],
  ) {}

  async update(
    person: number = this.person,
    profiles: number[] = this.profiles,
  ): Promise<
    Access
  > {
    Object.assign(this, {
      profiles,
    });

    await this.delete();
    await createNew(person, profiles);

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE FK_PERSONA = $1`,
      this.person,
    );
  }
}

export const hasAccessDefined = async (person: number): Promise<boolean> => {
  const { rows } = await postgres.query(
    `SELECT 1
    FROM ${TABLE}
    WHERE FK_PERSONA = $1`,
    person,
  );

  return !!rows.length;
};

export const findAll = async (): Promise<Access[]> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_PERSONA,
      ARRAY_AGG( FK_PERMISO)
    FROM ${TABLE}
    GROUP BY FK_PERSONA`,
  );

  const models = rows.map((row: [
    number,
    number[],
  ]) => new Access(...row));

  return models;
};

export const findById = async (id: number): Promise<Access | null> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_PERSONA,
      ARRAY_AGG(FK_PERMISO)
    FROM ${TABLE}
    WHERE FK_PERSONA = $1
    GROUP BY FK_PERSONA`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number[],
  ] = rows[0];

  return new Access(...result);
};

export const findByEmail = async (email: string): Promise<Access | null> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_PERSONA,
      ARRAY_AGG(FK_PERMISO)
    FROM ${TABLE} 
    WHERE FK_PERSONA = (SELECT PK_PERSONA FROM ${PEOPLE_TABLE} WHERE CORREO ILIKE $1)
    GROUP BY FK_PERSONA`,
    email,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number[],
  ] = rows[0];

  return new Access(...result);
};

export const createNew = async (
  person: number,
  profiles: number[],
): Promise<Access> => {
  await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_PERMISO
    ) VALUES ${profiles.map((profile) => `(${person}, ${profile})`).join(",")}`,
  );

  return new Access(
    person,
    profiles,
  );
};

class TableData {
  constructor(
    public id: number,
    public person: string,
    public profiles: string,
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
      A.FK_PERSONA AS ID,
      (SELECT NOMBRE FROM ${PEOPLE_TABLE} WHERE PK_PERSONA = A.FK_PERSONA) AS PERSON,
      ARRAY_TO_STRING(ARRAY_AGG(B.NOMBRE), ', ') AS PROFILES
    FROM
      ${TABLE} A
    INNER JOIN
      ${PROFILE_TABLE} B
      ON B.COD_PERMISO = A.FK_PERMISO
    GROUP BY A.FK_PERSONA`
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
