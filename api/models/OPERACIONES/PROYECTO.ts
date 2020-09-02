import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  getTableModels,
  TableOrder,
  TableResult,
} from "../../common/table.ts";
import {
  TABLE as CLIENT_TABLE,
} from "../CLIENTES/CLIENTE.ts";
import {
  TABLE as PEOPLE_TABLE,
} from "../ORGANIZACION/people.ts";
import {
  TABLE as SUB_AREA_TABLE,
} from "../ORGANIZACION/sub_area.ts";
import {
  TABLE as BUDGET_TABLE,
} from "./budget.ts";
import {
  TABLE as ACCESS_TABLE,
} from "../MAESTRO/access.ts";
import { Profiles } from "../../common/profiles.ts";

export const TABLE = "OPERACIONES.PROYECTO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el proyecto por que hay componentes que dependen de el";

//TODO
//Project status should be a postgres enum
//Should be validated by AJV as well
class Proyecto {
  constructor(
    public readonly pk_proyecto: number,
    public readonly fk_tipo_proyecto: number,
    public fk_cliente: number,
    public fk_sub_area: number,
    public nombre: string,
    public fk_supervisor: number,
    public descripcion: string,
    public estado: number,
  ) {}

  /*
  * Supervisors also include the area supervisor, this function returns both
  * */
  async getSupervisors(): Promise<number[]> {
    const { rows } = await postgres.query(
      `SELECT
        ARRAY[P.FK_SUPERVISOR,SA.FK_SUPERVISOR]
      FROM ${TABLE} P 
      JOIN ${SUB_AREA_TABLE} SA ON P.FK_SUB_AREA = SA.PK_SUB_AREA 
      WHERE PK_PROYECTO = $1`,
      this.pk_proyecto,
    );

    return rows[0][0];
  }

  async hasOpenBudget(): Promise<boolean> {
    const { rows } = await postgres.query(
      `SELECT
        CASE WHEN COUNT(1) > 0 THEN TRUE ELSE FALSE END
      FROM ${BUDGET_TABLE}
      WHERE FK_PROYECTO = $1
      AND ESTADO = TRUE`,
      this.pk_proyecto,
    );

    return rows[0][0];
  }

  async update(
    fk_cliente: number = this.fk_cliente,
    fk_sub_area: number = this.fk_sub_area,
    nombre: string = this.nombre,
    fk_supervisor: number = this.fk_supervisor,
    descripcion: string = this.descripcion,
    estado: number = this.estado,
  ): Promise<
    Proyecto
  > {
    Object.assign(this, {
      fk_cliente,
      fk_sub_area,
      nombre,
      fk_supervisor,
      descripcion,
      estado,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FK_CLIENTE = $2,
        FK_SUB_AREA = $3,
        NOMBRE = $4,
        FK_SUPERVISOR = $5,
        DESCRIPCION = $6,
        ESTADO = $7
      WHERE PK_PROYECTO = $1`,
      this.pk_proyecto,
      this.fk_cliente,
      this.fk_sub_area,
      this.nombre,
      this.fk_supervisor,
      this.descripcion,
      this.estado,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PROYECTO = $1`,
      this.pk_proyecto,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (
  assignated_only: boolean,
  user: number,
): Promise<Proyecto[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PROYECTO,
      FK_TIPO_PROYECTO,
      FK_CLIENTE,
      FK_SUB_AREA,
      NOMBRE,
      FK_SUPERVISOR,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}
    ${
      assignated_only
        ? `WHERE PK_PROYECTO IN (
            WITH ADMIN_USERS AS (
              SELECT FK_PERSONA AS USERS
              FROM ${ACCESS_TABLE}
              WHERE FK_PERMISO IN (
                ${Profiles.ADMINISTRATOR},
                ${Profiles.CONTROLLER}
              )
            )
            SELECT
              PK_PROYECTO
            FROM (
              SELECT
                PRO.PK_PROYECTO,
                UNNEST(ARRAY_CAT(
                  ARRAY[PRO.FK_SUPERVISOR, SA.FK_SUPERVISOR],
                  (SELECT ARRAY_AGG(USERS) FROM ADMIN_USERS)
                )) AS SUPERVISOR
              FROM ${TABLE} PRO
              JOIN ${SUB_AREA_TABLE} SA
                ON SA.PK_SUB_AREA = PRO.FK_SUB_AREA
              GROUP BY
                PRO.PK_PROYECTO,
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
    number,
    number,
    string,
    number,
    string,
    number,
  ]) => new Proyecto(...row));
};

export const findById = async (id: number): Promise<Proyecto | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PROYECTO,
      FK_TIPO_PROYECTO,
      FK_CLIENTE,
      FK_SUB_AREA,
      NOMBRE,
      FK_SUPERVISOR,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}
    WHERE PK_PROYECTO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    number,
    string,
    number,
    string,
    number,
  ] = rows[0];

  return new Proyecto(...result);
};

export const searchByNameAndClient = async (
  client: number,
  query: string,
  limit: number,
): Promise<Proyecto[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PROYECTO,
      FK_TIPO_PROYECTO,
      FK_CLIENTE,
      FK_SUB_AREA,
      NOMBRE,
      FK_SUPERVISOR,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}
    WHERE FK_CLIENTE = $1
    AND UNACCENT(NOMBRE) ILIKE $2
    ${limit ? `LIMIT ${limit}` : ""}`,
    client,
    `%${query || "%"}%`,
  );

  return rows.map((result: [
    number,
    number,
    number,
    number,
    string,
    number,
    string,
    number,
  ]) => new Proyecto(...result));
};

export const createNew = async (
  fk_tipo_proyecto: number,
  fk_cliente: number,
  fk_sub_area: number,
  nombre: string,
  fk_supervisor: number,
  descripcion: string,
  estado: number,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_TIPO_PROYECTO,
      FK_CLIENTE,
      FK_SUB_AREA,
      NOMBRE,
      FK_SUPERVISOR,
      DESCRIPCION,
      ESTADO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    ) RETURNING PK_PROYECTO`,
    fk_tipo_proyecto,
    fk_cliente,
    fk_sub_area,
    nombre,
    fk_supervisor,
    descripcion,
    estado,
  );

  const id: number = rows[0][0];

  return new Proyecto(
    id,
    fk_tipo_proyecto,
    fk_cliente,
    fk_sub_area,
    nombre,
    fk_supervisor,
    descripcion,
    estado,
  );
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public client: string,
    public sub_area: string,
    public supervisor: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_PROYECTO AS ID,
      NOMBRE AS NAME,
      (SELECT NOMBRE FROM ${CLIENT_TABLE} WHERE PK_CLIENTE = FK_CLIENTE) AS CLIENT,
      (SELECT NOMBRE FROM ${SUB_AREA_TABLE} WHERE PK_SUB_AREA = FK_SUB_AREA) AS SUB_AREA,
      (SELECT NOMBRE FROM ${PEOPLE_TABLE} WHERE PK_PERSONA = FK_SUPERVISOR) AS SUPERVISOR
    FROM ${TABLE}`
  );

  const { count, data } = await getTableModels(
    base_query,
    order,
    page,
    rows,
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
