import postgres from "../../services/postgres.js";
import { TABLE as GENDER_TABLE } from "../MAESTRO/gender.ts";

export const TABLE = "USUARIOS.HIJO";

class Children {
  constructor(
    public readonly id: number,
    public readonly parent: number,
    public gender: number,
    public name: string,
    public born_date: string,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_HIJO = $1`,
      this.id,
    );
  }

  async update(
    gender: number,
    name: string,
    born_date: string,
  ): Promise<Children> {
    Object.assign(this, {
      gender,
      name,
      born_date,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_GENERO = $2,
        NOMBRE = $3,
        FEC_NACIMIENTO = $4
      WHERE PK_HIJO = $1`,
      this.id,
      this.gender,
      this.name,
      this.born_date,
    );

    return this;
  }
}

export const create = async (
  parent: number,
  gender: number,
  name: string,
  born_date: string,
): Promise<Children> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PADRE,
      FK_GENERO,
      NOMBRE,
      FEC_NACIMIENTO
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    ) RETURNING PK_HIJO`,
    parent,
    gender,
    name,
    born_date,
  );

  const id: number = rows[0][0];

  return new Children(
    id,
    parent,
    gender,
    name,
    born_date,
  );
};

/*
* Person id is required in order to not tleak other users childrens
* */
export const findAll = async (person: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_HIJO,
      FK_PADRE,
      FK_GENERO,
      NOMBRE,
      TO_CHAR(FEC_NACIMIENTO, 'YYYY-MM-DD')
    FROM ${TABLE}
    WHERE FK_PADRE = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    number,
    string,
    string,
  ]) => new Children(...row));
};

/*
* Person id is required in order to not tleak other users childrens
* */
export const findById = async (
  person: number,
  id: number,
): Promise<Children | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_HIJO,
      FK_PADRE,
      FK_GENERO,
      NOMBRE,
      TO_CHAR(FEC_NACIMIENTO, 'YYYY-MM-DD')
    FROM ${TABLE}
    WHERE FK_PADRE = $1
    AND PK_HIJO = $2`,
    person,
    id,
  );

  if (!rows.length) return null;

  return new Children(
    ...rows[0] as [
      number,
      number,
      number,
      string,
      string,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly gender_id: number,
    public readonly gender: string,
    public readonly name: string,
    public readonly born_date: string,
  ) {}
}

export const getTable = async (person: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_HIJO,
      FK_GENERO,
      (SELECT NOMBRE FROM ${GENDER_TABLE} WHERE PK_GENERO = FK_GENERO),
      NOMBRE,
      TO_CHAR(FEC_NACIMIENTO, 'YYYY-MM-DD')
    FROM ${TABLE}
    WHERE FK_PADRE = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    string,
    string,
    string,
  ]) => new TableData(...row));
};
