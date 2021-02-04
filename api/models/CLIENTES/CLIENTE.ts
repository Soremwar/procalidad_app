import postgres from "../../services/postgres.ts";
import type { PostgresError } from "deno_postgres";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as SECTOR_TABLE } from "./SECTOR.ts";
import { TABLE as PROJECT_TABLE } from "../OPERACIONES/PROYECTO.ts";
import { TABLE as SUB_AREA_TABLE } from "../ORGANIZACION/sub_area.ts";
import { TABLE as ACCESS_TABLE } from "../MAESTRO/access.ts";
import { Profiles } from "../../common/profiles.ts";

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

export const create = async (
  fk_sector: number,
  nombre: string,
  nit: string,
  d_verificacion: number,
  razon_social: string,
  fk_ciudad: number,
  direccion: string,
): Promise<Cliente> => {
  const { rows } = await postgres.query(
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
    ) RETURNING PK_CLIENTE`,
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

  const id: number = rows[0][0];

  return new Cliente(
    id,
    fk_sector,
    nombre,
    nit,
    d_verificacion,
    razon_social,
    fk_ciudad,
    direccion,
  );
};

export const getAll = async (
  assignated_only: boolean,
  user: number,
): Promise<Cliente[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CLIENTE,
      FK_SECTOR,
      NOMBRE,
      NIT,
      D_VERIFICACION,
      RAZON_SOCIAL,
      FK_CIUDAD,
      DIRECCION
    FROM ${TABLE}
    ${
      assignated_only
        ? `WHERE PK_CLIENTE IN (
            WITH ADMIN_USERS AS (
              SELECT FK_PERSONA AS USERS
              FROM ${ACCESS_TABLE}
              WHERE FK_PERMISO IN (
                ${Profiles.ADMINISTRATOR},
                ${Profiles.CONTROLLER}
              )
            )
            SELECT
              FK_CLIENTE
            FROM (
              SELECT
                PRO.FK_CLIENTE,
                UNNEST(ARRAY_CAT(
                  ARRAY[PRO.FK_SUPERVISOR, SA.FK_SUPERVISOR],
                  (SELECT ARRAY_AGG(USERS) FROM ADMIN_USERS)
                )) AS SUPERVISOR
              FROM ${PROJECT_TABLE} PRO
              JOIN ${SUB_AREA_TABLE} SA
                ON SA.PK_SUB_AREA = PRO.FK_SUB_AREA
              GROUP BY
                PRO.FK_CLIENTE,
                SUPERVISOR
            ) A
            WHERE SUPERVISOR = ${user}
          )`
        : ""
    }`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    string,
    number,
    string,
    number,
    string,
  ]) => new Cliente(...row));
};

export const findById = async (id: number): Promise<Cliente | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CLIENTE,
      FK_SECTOR,
      NOMBRE,
      NIT,
      D_VERIFICACION,
      RAZON_SOCIAL,
      FK_CIUDAD,
      DIRECCION
    FROM ${TABLE}
    WHERE PK_CLIENTE = $1`,
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
    string,
  ] = rows[0];

  return new Cliente(...result);
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
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
        PK_CLIENTE AS ID,
        (SELECT NOMBRE FROM ${SECTOR_TABLE} WHERE PK_SECTOR = FK_SECTOR) AS SECTOR,
        NOMBRE AS NAME,
        NIT||'-'||D_VERIFICACION AS NIT,
        RAZON_SOCIAL AS BUSINESS
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
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
