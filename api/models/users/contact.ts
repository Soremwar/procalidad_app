import postgres from "../../services/postgres.ts";
import { TABLE as PERSON_TABLE } from "../ORGANIZACION/people.ts";

export const TABLE = "USUARIOS.CONTACTO";

export enum Relationships {
  "Madre" = "Madre",
  "Padre" = "Padre",
  "Conyuge" = "Conyuge",
  "Hij@" = "Hij@",
  "Herman@" = "Herman@",
  "Otro" = "Otro",
}

class Contact {
  constructor(
    public readonly id: number,
    public readonly employee: number,
    public name: string,
    public employee_relationship: Relationships,
    public cellphone: number,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_CONTACTO = $1`,
      this.id,
    );
  }

  async update(
    name: string = this.name,
    employee_relationship: Relationships = this.employee_relationship,
    cellphone: number = this.cellphone,
  ): Promise<Contact> {
    Object.assign(this, {
      name,
      employee_relationship,
      cellphone,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        PARENTESCO = $3,
        TELEFONO = $4
      WHERE PK_CONTACTO = $1`,
      this.id,
      this.name,
      this.employee_relationship,
      this.cellphone,
    );

    return this;
  }
}

export const create = async (
  person: number,
  name: string,
  employee_relationship: Relationships,
  cellphone: number,
): Promise<Contact> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_EMPLEADO,
      NOMBRE,
      PARENTESCO,
      TELEFONO
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    ) RETURNING PK_CONTACTO`,
    person,
    name,
    employee_relationship,
    cellphone,
  );

  const id: number = rows[0][0];

  return new Contact(
    id,
    person,
    name,
    employee_relationship,
    cellphone,
  );
};

//TODO
//Add enum support
/*
* As always to avoid leaking information, the user id must be provided
* */
export const findAll = async (person: number): Promise<Contact[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTACTO,
      FK_EMPLEADO,
      NOMBRE,
      PARENTESCO::VARCHAR,
      TELEFONO
    FROM ${TABLE}
    WHERE FK_EMPLEADO = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    string,
    Relationships,
    number,
  ]) => new Contact(...row));
};

//TODO
//Add enum support
/*
* As always to avoid leaking information, the user id must be provided
* */
export const findById = async (
  person: number,
  id: number,
): Promise<Contact | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTACTO,
      FK_EMPLEADO,
      NOMBRE,
      PARENTESCO::VARCHAR,
      TELEFONO
    FROM ${TABLE}
    WHERE FK_EMPLEADO = $1
    AND PK_CONTACTO = $2`,
    person,
    id,
  );

  if (!rows.length) return null;

  return new Contact(
    ...rows[0] as [
      number,
      number,
      string,
      Relationships,
      number,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly employee_id: number,
    public readonly employee: string,
    public readonly name: string,
    public readonly cellphone: number,
    public readonly employee_relationship: string,
  ) {}
}

//TODO
//Add enum support
export const getTable = async (person: number) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTACTO,
      FK_EMPLEADO,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_EMPLEADO),
      NOMBRE,
      TELEFONO,
      PARENTESCO::VARCHAR
    FROM ${TABLE}
    WHERE FK_EMPLEADO = $1`,
    person,
  );

  return rows.map((row: [
    number,
    number,
    string,
    string,
    number,
    string,
  ]) => new TableData(...row));
};
