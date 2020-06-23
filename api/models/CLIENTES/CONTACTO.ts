import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder
} from "../../common/table.ts";

const TABLE = "CLIENTES.CONTACTO";

const ERROR_CONSTRAINT = "El cliente especificado para el contacto no existe";

class Contacto {
  constructor(
    public readonly pk_contacto: number,
    public nombre: string,
    public area: string | null,
    public cargo: string | null,
    public fk_cliente: number,
    public telefono: string,
    public telefono_2: string | null,
    public correo: string,
  ) {}

  async update(
    nombre: string = this.nombre,
    area: string | null = this.area,
    cargo: string | null = this.cargo,
    fk_cliente: number = this.fk_cliente,
    telefono: string = this.telefono,
    telefono_2: string | null = this.telefono,
    correo: string = this.correo,
  ): Promise<
    Contacto
  > {
    Object.assign(this, {
      nombre,
      area,
      cargo,
      fk_cliente,
      telefono,
      telefono_2,
      correo,
    });
    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        AREA = $3,
        CARGO = $4,
        FK_CLIENTE = $5,
        TELEFONO = $6,
        TELEFONO_2 = $7,
        CORREO = $8
      WHERE PK_CONTACTO = $1`,
      this.pk_contacto,
      this.nombre,
      this.area,
      this.cargo,
      this.fk_cliente,
      this.telefono,
      this.telefono_2,
      this.correo,
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
      `DELETE FROM ${TABLE} WHERE PK_CONTACTO = $1`,
      this.pk_contacto,
    );
  }
}

export const findAll = async (): Promise<Contacto[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTACTO,
      NOMBRE,
      AREA,
      CARGO,
      FK_CLIENTE,
      TELEFONO,
      TELEFONO_2,
      CORREO
    FROM ${TABLE}`,
  );
  const models = rows.map((row: [
    number,
    string,
    string | null,
    string | null,
    number,
    string,
    string | null,
    string,
  ]) => new Contacto(...row));

  return models;
};

export const findById = async (id: number): Promise<Contacto | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CONTACTO,
      NOMBRE,
      AREA,
      CARGO,
      FK_CLIENTE,
      TELEFONO,
      TELEFONO_2,
      CORREO
    FROM ${TABLE}
    WHERE PK_CONTACTO = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    string,
    string | null,
    string | null,
    number,
    string,
    string | null,
    string,
  ] = rows[0];
  return new Contacto(...result);
};

export const createNew = async (
  nombre: string,
  area: string | null,
  cargo: string | null,
  fk_cliente: number,
  telefono: string,
  telefono_2: string | null,
  correo: string,
): Promise<void> => {
  await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      AREA,
      CARGO,
      FK_CLIENTE,
      TELEFONO,
      TELEFONO_2,
      CORREO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )`,
    nombre,
    area,
    cargo,
    fk_cliente,
    telefono,
    telefono_2,
    correo,
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
    public id_client: number,
    public name: string,
    public phone: string,
    public email: string,
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
        PK_CONTACTO AS ID,
        FK_CLIENTE AS ID_CLIENT,
        NOMBRE AS NAME,
        TELEFONO AS PHONE,
        CORREO AS EMAIL
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
  ]) => new TableData(...x));

  return models;
};
