import postgres from "../../services/postgres.js";
import type { PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";
import { TABLE as PEOPLE_TABLE } from "./people.ts";

export const TABLE = "ORGANIZACION.TIPO_AREA";

const ERROR_CONSTRAINT =
  "El supervisor ingresado para el tipo de area no existe";
const ERROR_DEPENDENCY =
  "No se puede eliminar el tipo de area por que hay componentes que dependen de el";

class AreaType {
  constructor(
    public readonly id: number,
    public name: string,
    public supervisor: number,
    public time_records: boolean,
  ) {}

  async update(
    name: string = this.name,
    supervisor: number = this.supervisor,
    time_records: boolean = this.time_records,
  ): Promise<AreaType> {
    Object.assign(this, {
      name,
      supervisor,
      time_records,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        FK_SUPERVISOR = $3,
        BAN_REGISTRABLE = $4
      WHERE PK_TIPO = $1`,
      this.id,
      this.name,
      this.supervisor,
      this.time_records,
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
      `DELETE FROM ${TABLE}
      WHERE PK_TIPO = $1`,
      this.id,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<AreaType[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_TIPO,
      NOMBRE,
      FK_SUPERVISOR,
      BAN_REGISTRABLE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
    number,
    boolean,
  ]) => new AreaType(...row));
};

export const findById = async (id: number): Promise<AreaType | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_TIPO,
      NOMBRE,
      FK_SUPERVISOR,
      BAN_REGISTRABLE
    FROM ${TABLE}
    WHERE PK_TIPO = $1`,
    id,
  );

  if (!rows[0]) return null;

  return new AreaType(
    ...rows[0] as [
      number,
      string,
      number,
      boolean,
    ],
  );
};

export const createNew = async (
  name: string,
  supervisor: number,
  time_records: boolean,
): Promise<AreaType> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      FK_SUPERVISOR,
      BAN_REGISTRABLE
    ) VALUES (
      $1,
      $2,
      $3
    ) RETURNING PK_TIPO`,
    name,
    supervisor,
    time_records,
  ).catch((e: PostgresError) => {
    if (e.fields.constraint) {
      e.message = ERROR_CONSTRAINT;
    }

    throw e;
  });

  const id: number = rows[0][0];

  return new AreaType(
    id,
    name,
    supervisor,
    time_records,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public supervisor: string,
    public time_records: boolean,
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
      PK_TIPO AS ID,
      NOMBRE AS NAME,
      (SELECT NOMBRE FROM ${PEOPLE_TABLE} WHERE PK_PERSONA = FK_SUPERVISOR) AS SUPERVISOR,
      BAN_REGISTRABLE
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
    boolean,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
