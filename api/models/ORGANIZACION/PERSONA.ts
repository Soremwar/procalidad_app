import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

export const TABLE = "ORGANIZACION.PERSONA";
const ERROR_DEPENDENCY =
  "No se puede eliminar la persona por que hay componentes que dependen de el";

export enum TipoIdentificacion {
  CC = "CC",
  CE = "CE",
  PA = "PA",
  RC = "RC",
  TI = "TI",
}

class Persona {
  constructor(
    public readonly pk_persona: number,
    public tipo_identificacion: TipoIdentificacion,
    public identificacion: string,
    public nombre: string,
    public telefono: string,
    public correo: string,
  ) { }

  async update(
    tipo_identificacion: TipoIdentificacion = this.tipo_identificacion,
    identificacion: string = this.identificacion,
    nombre: string = this.nombre,
    telefono: string = this.telefono,
    correo: string = this.correo,
  ): Promise<Persona> {
    Object.assign(this, {
      tipo_identificacion,
      identificacion,
      nombre,
      telefono,
      correo,
    });
    await postgres.query(
      `UPDATE ${TABLE} SET
        TIPO_IDENTIFICACION = $2,
        IDENTIFICACION = $3,
        NOMBRE = $4,
        TELEFONO = $5,
        CORREO = $6
      WHERE PK_PERSONA = $1`,
      this.pk_persona,
      this.tipo_identificacion,
      this.identificacion,
      this.nombre,
      this.telefono,
      this.correo,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PERSONA = $1`,
      this.pk_persona,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Persona[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PERSONA,
      TIPO_IDENTIFICACION,
      IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    TipoIdentificacion,
    string,
    string,
    string,
    string,
  ]) => {
    row[1] = row[1] in TipoIdentificacion
      ? row[1]
      : TipoIdentificacion.CC;
    return new Persona(...row);
  });

  return models;
};

export const findById = async (id: number): Promise<Persona | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PERSONA,
      TIPO_IDENTIFICACION,
      IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO
    FROM ${TABLE}
    WHERE PK_PERSONA = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    TipoIdentificacion,
    string,
    string,
    string,
    string,
  ] = rows[0];

  result[1] = result[1] in TipoIdentificacion
    ? result[1]
    : TipoIdentificacion.CC;

  return new Persona(...result);
};

export const createNew = async (
  tipo_identificacion: TipoIdentificacion,
  identificacion: string,
  nombre: string,
  telefono: string,
  correo: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      TIPO_IDENTIFICACION,
      IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING PK_PERSONA`,
    tipo_identificacion,
    identificacion,
    nombre,
    telefono,
    correo,
  );

  const id: number = rows[0][0];

  return new Persona(
    id,
    tipo_identificacion,
    identificacion,
    nombre,
    telefono,
    correo,
  );
};

class TableData {
  constructor(
    public id: number,
    public identification: string,
    public name: string,
    public phone: string,
    public email: string,
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
      PK_PERSONA AS ID,
      TIPO_IDENTIFICACION||IDENTIFICACION AS IDENTIFICATION,
      NOMBRE AS NAME,
      TELEFONO AS PHONE,
      CORREO AS EMAIL
    FROM ${TABLE}
    ) AS TOTAL` +
    " " +
    `WHERE UNACCENT(IDENTIFICATION) ILIKE '%${search}%' OR UNACCENT(NAME) ILIKE '%${search}%' OR UNACCENT(PHONE) ILIKE '%${search}%' OR UNACCENT(EMAIL) ILIKE '%${search}%'` +
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
    string,
  ]) => new TableData(...x));

  return models;
};
