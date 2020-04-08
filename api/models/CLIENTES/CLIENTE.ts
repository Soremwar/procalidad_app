import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder
} from "../../common/table.ts";

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
    public ciudad: string,
    public direccion: string,
  ) {}

  async update(
    fk_sector: number = this.fk_sector,
    nombre: string = this.nombre,
    nit: string = this.nit,
    d_verificacion: number = this.d_verificacion,
    razon_social: string = this.razon_social,
    ciudad: string = this.ciudad,
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
        ciudad,
        direccion,
      },
    );
    await postgres.query(
      "UPDATE CLIENTES.CLIENTE SET FK_SECTOR = $2, NOMBRE = $3, NIT = $4, D_VERIFICACION = $5, RAZON_SOCIAL = $6, CIUDAD = $7, DIRECCION = $8 WHERE PK_CLIENTE = $1",
      this.pk_cliente,
      this.fk_sector,
      this.nombre,
      this.nit,
      this.d_verificacion,
      this.razon_social,
      this.ciudad,
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
      "DELETE FROM CLIENTES.CLIENTE WHERE PK_CLIENTE = $1",
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
    "SELECT PK_CLIENTE, FK_SECTOR, NOMBRE, NIT, D_VERIFICACION, RAZON_SOCIAL, CIUDAD, DIRECCION FROM CLIENTES.CLIENTE",
  );

  const models = rows.map((row: [
    number,
    number,
    string,
    string,
    number,
    string,
    string,
    string,
  ]) => new Cliente(...row));

  return models;
};

export const findById = async (id: number): Promise<Cliente | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_CLIENTE, FK_SECTOR, NOMBRE, NIT, D_VERIFICACION, RAZON_SOCIAL, CIUDAD, DIRECCION FROM CLIENTES.CLIENTE WHERE PK_CLIENTE = $1",
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
    string,
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
  ciudad: string,
  direccion: string,
): Promise<void> => {
  await postgres.query(
    "INSERT INTO CLIENTES.CLIENTE (FK_SECTOR, NOMBRE, NIT, D_VERIFICACION, RAZON_SOCIAL, CIUDAD, DIRECCION) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    fk_sector,
    nombre,
    nit,
    d_verificacion,
    razon_social,
    ciudad,
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
    public code_sector: number,
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
  search: string,
): Promise<any> => {
  //TODO
  //Replace search string with search object passed from the frontend table definition

  //TODO
  //Normalize query generator

  const query =
    "SELECT * FROM (SELECT PK_CLIENTE AS ID, FK_SECTOR AS CODE_SECTOR, (SELECT NOMBRE FROM CLIENTES.SECTOR WHERE PK_SECTOR = FK_SECTOR) AS SECTOR, NOMBRE AS NAME, NIT||'-'||D_VERIFICACION AS NIT, RAZON_SOCIAL AS BUSINESS FROM CLIENTES.CLIENTE) AS TOTAL" +
      " " +
      `WHERE UNACCENT(SECTOR) ILIKE '%${search}%' OR UNACCENT(NAME) ILIKE '%${search}%' OR UNACCENT(NIT) ILIKE '%${search}%'` +
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
    number,
    string,
    string,
    string,
    string,
  ]) => new TableData(...x));

  return models;
};
