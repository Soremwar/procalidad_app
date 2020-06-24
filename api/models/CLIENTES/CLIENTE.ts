import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";
import {
  TABLE as STATE_TABLE,
} from "../MAESTRO/ESTADO.ts";
import {
  TABLE as CITY_TABLE,
} from "../MAESTRO/CIUDAD.ts";
import {
  TABLE as SECTOR_TABLE,
} from "./SECTOR.ts";

export const TABLE = "CLIENTES.CLIENTE";

const ERROR_CONSTRAINT = "El sector ingresado para el cliente no existe";
const ERROR_DEPENDENCY =
  "No se puede eliminar el cliente por que hay componentes que dependen de el";

class Cliente {
  constructor(
    public readonly pk_cliente: number,
    public fk_sector: number,
    public nombre: string,
    public nit: string,
    public d_verificacion: number,
    public razon_social: string,
    public fk_pais: number | undefined,
    public fk_estado: number | undefined,
    public fk_ciudad: number,
    public direccion: string,
  ) {}

  async update(
    fk_sector: number = this.fk_sector,
    nombre: string = this.nombre,
    nit: string = this.nit,
    d_verificacion: number = this.d_verificacion,
    razon_social: string = this.razon_social,
    fk_ciudad: number = this.fk_ciudad,
    direccion: string = this.direccion,
  ): Promise<
    Cliente
  > {
    Object.assign(
      this,
      {
        fk_sector,
        nombre,
        nit,
        d_verificacion,
        razon_social,
        fk_ciudad,
        direccion,
      },
    );
    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_SECTOR = $2,
        NOMBRE = $3,
        NIT = $4,
        D_VERIFICACION = $5,
        RAZON_SOCIAL = $6,
        FK_CIUDAD = $7,
        DIRECCION = $8
      WHERE PK_CLIENTE = $1`,
      this.pk_cliente,
      this.fk_sector,
      this.nombre,
      this.nit,
      this.d_verificacion,
      this.razon_social,
      this.fk_ciudad,
      this.direccion,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_CONSTRAINT;
      }

      throw e;
    });

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_CLIENTE = $1`,
      this.pk_cliente,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Cliente[]> => {
  const { rows } = await postgres.query(
    `SELECT
      CL.PK_CLIENTE,
      CL.FK_SECTOR,
      CL.NOMBRE,
      CL.NIT,
      CL.D_VERIFICACION,
      CL.RAZON_SOCIAL,
      ST.FK_PAIS,
      CT.FK_ESTADO,
      CL.FK_CIUDAD,
      CL.DIRECCION
    FROM
      ${TABLE} AS CL
    JOIN ${CITY_TABLE} AS CT
      ON CL.FK_CIUDAD = CT.PK_CIUDAD
    JOIN ${STATE_TABLE} AS ST
    ON CT.FK_ESTADO = ST.PK_ESTADO`,
  );

  const models = rows.map((row: [
    number,
    number,
    string,
    string,
    number,
    string,
    number,
    number,
    number,
    string,
  ]) => new Cliente(...row));

  return models;
};

export const findById = async (id: number): Promise<Cliente | null> => {
  const { rows } = await postgres.query(
    `SELECT
      CL.PK_CLIENTE,
      CL.FK_SECTOR,
      CL.NOMBRE,
      CL.NIT,
      CL.D_VERIFICACION,
      CL.RAZON_SOCIAL,
      ST.FK_PAIS,
      CT.FK_ESTADO,
      CL.FK_CIUDAD,
      CL.DIRECCION
    FROM
      ${TABLE} AS CL
    JOIN ${CITY_TABLE} AS CT
      ON CL.FK_CIUDAD = CT.PK_CIUDAD
    JOIN ${STATE_TABLE} AS ST
      ON CT.FK_ESTADO = ST.PK_ESTADO
    WHERE CL.PK_CLIENTE = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    number,
    string,
    string,
    number,
    string,
    number,
    number,
    number,
    string,
  ] = rows[0];
  return new Cliente(...result);
};

export const createNew = async (
  fk_sector: number,
  nombre: string,
  nit: string,
  d_verificacion: number,
  razon_social: string,
  fk_ciudad: number,
  direccion: string,
): Promise<void> => {
  await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_SECTOR,
      NOMBRE,
      NIT,
      D_VERIFICACION,
      RAZON_SOCIAL,
      FK_CIUDAD,
      DIRECCION
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )`,
    fk_sector,
    nombre,
    nit,
    d_verificacion,
    razon_social,
    fk_ciudad,
    direccion,
  ).catch((e: PostgresError) => {
    if (e.fields.constraint) {
      e.message = ERROR_CONSTRAINT;
    }

    throw e;
  });
};

class TableData {
  constructor(
    public id: number,
    public sector: string,
    public name: string,
    public nit: string,
    public business: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: {[key: string]: string},
): Promise<any> => {

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (
      SELECT
        PK_CLIENTE AS ID,
        (SELECT NOMBRE FROM ${SECTOR_TABLE} WHERE PK_SECTOR = FK_SECTOR) AS SECTOR,
        NOMBRE AS NAME,
        NIT||'-'||D_VERIFICACION AS NIT,
        RAZON_SOCIAL AS BUSINESS
      FROM ${TABLE}
    ) AS TOTAL` +
    " " +
    (Object.keys(search).length
        ? `WHERE ${Object.entries(search)
            .map(([column, value]) => (
                `CAST(${column} AS VARCHAR) ILIKE '${value || '%'}'`
            )).join(' AND ')}`
        : '') +
    " " +
    (Object.values(order).length
      ? `ORDER BY ${
        Object.entries(order).map(([column, order]) => `${column} ${order}`)
          .join(", ")
      }`
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
