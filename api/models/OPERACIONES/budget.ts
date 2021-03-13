import postgres, { queryObject } from "../../services/postgres.ts";
import type { PostgresError } from "deno_postgres";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { findById as findProject, TABLE as PROJECT_TABLE } from "./PROYECTO.ts";
import { TABLE as BUDGET_TYPE_TABLE } from "./TIPO_PRESUPUESTO.ts";
import { TABLE as CLIENT_TABLE } from "../CLIENTES/CLIENTE.ts";
import { Budget as BudgetInterface } from "../interfaces.ts";

export const TABLE = "OPERACIONES.PRESUPUESTO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el presupuesto por que hay componentes que dependen de el";

const fields = [
  "PK_PRESUPUESTO",
  "FK_PROYECTO",
  "FK_TIPO_PRESUPUESTO",
  "NOMBRE",
  "DESCRIPCION",
  "ESTADO",
];

class Budget {
  constructor(
    public readonly pk_presupuesto: number,
    public fk_cliente: number | undefined,
    public readonly fk_proyecto: number,
    public fk_tipo_presupuesto: number,
    public nombre: string,
    public descripcion: string,
    public estado: boolean,
  ) {}

  async update(
    fk_tipo_presupuesto: number = this.fk_tipo_presupuesto,
    nombre: string = this.nombre,
    descripcion: string = this.descripcion,
    nuevo_estado?: boolean,
  ): Promise<
    Budget
  > {
    //Revisa si el nuevo estado ha cambiado
    //Si el nuevo estado es abierto corre la validacion de presupuesto unico
    if (
      nuevo_estado !== this.estado && nuevo_estado !== undefined &&
      nuevo_estado
    ) {
      const project = await findProject(this.fk_proyecto);
      if (!project) {
        throw new Error("El proyecto asociado a este presupuesto no existe");
      }

      if (await project.hasOpenBudget()) {
        throw new Error(
          "El proyecto asociado a este presupuesto ya tiene un presupuesto abierto",
        );
      }
    }
    Object.assign(this, {
      fk_tipo_presupuesto,
      nombre,
      descripcion,
      estado: nuevo_estado ?? this.estado,
    });
    await postgres.query(
      `UPDATE ${TABLE}
      SET
        FK_PROYECTO = $2,
        FK_TIPO_PRESUPUESTO = $3,
        NOMBRE = $4,
        DESCRIPCION = $5,
        ESTADO = $6
      WHERE PK_PRESUPUESTO = $1`,
      this.pk_presupuesto,
      this.fk_proyecto,
      this.fk_tipo_presupuesto,
      this.nombre,
      this.descripcion,
      nuevo_estado ?? this.estado,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PRESUPUESTO = $1`,
      this.pk_presupuesto,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async ({
  open,
  project,
}: {
  open?: boolean;
  project?: number;
}): Promise<Budget[]> => {
  const { rows } = await queryObject<BudgetInterface>({
    text: (
      `SELECT
        PK_PRESUPUESTO,
        FK_PROYECTO,
        FK_TIPO_PRESUPUESTO,
        NOMBRE,
        DESCRIPCION,
        ESTADO
      FROM ${TABLE}
      WHERE 1 = 1
      ${open ? `AND ESTADO = ${open}` : ""}
      ${project ? `AND FK_PROYECTO = ${project}` : ""}`
    ),
    fields,
  });

  return rows.map((row) =>
    new Budget(
      row.pk_presupuesto,
      undefined,
      row.fk_proyecto,
      row.fk_tipo_presupuesto,
      row.nombre,
      row.descripcion,
      row.estado,
    )
  );
};

export const findById = async (id: number): Promise<Budget | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PRESUPUESTO,
      (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = FK_PROYECTO) AS FK_CLIENTE,
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}
    WHERE PK_PRESUPUESTO = $1`,
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    number,
    number,
    number,
    string,
    string,
    boolean,
  ] = rows[0];
  return new Budget(...result);
};

/*
* Works under the premise that only one budget can be open at a time
* for a given project. If that were to change this whole system would have
* to be reformulated
* */
export const findOpenBudgetByProject = async (
  project: number,
): Promise<Budget | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PRESUPUESTO,
      (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = FK_PROYECTO) AS FK_CLIENTE,
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO
    FROM ${TABLE}
    WHERE FK_PROYECTO = $1
    AND ESTADO = TRUE`,
    project,
  );

  if (!rows[0]) return null;

  return new Budget(
    ...rows[0] as [
      number,
      number,
      number,
      number,
      string,
      string,
      boolean,
    ],
  );
};

export const createNew = async (
  fk_proyecto: number,
  fk_tipo_presupuesto: number,
  nombre: string,
  descripcion: string,
  abierto: boolean,
): Promise<number> => {
  if (abierto) {
    const project = await findProject(fk_proyecto);
    if (!project) {
      throw new Error("El proyecto asociado a este presupuesto no existe");
    }

    if (await project.hasOpenBudget()) {
      throw new Error(
        "El proyecto asociado a este presupuesto ya tiene un presupuesto abierto",
      );
    }
  }

  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING PK_PRESUPUESTO`,
    fk_proyecto,
    fk_tipo_presupuesto,
    nombre,
    descripcion,
    abierto,
  );

  //Returns created id
  return rows[0][0];
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public project: string,
    public client: string,
    public budget_type: string,
    public status: string,
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
      PRE.PK_PRESUPUESTO AS ID,
      PRE.NOMBRE AS NAME,
      PRO.NOMBRE AS PROJECT,
      (SELECT NOMBRE FROM ${CLIENT_TABLE} WHERE PRO.FK_CLIENTE = PK_CLIENTE) AS CLIENT,
      (SELECT NOMBRE FROM ${BUDGET_TYPE_TABLE} WHERE PK_TIPO = PRE.FK_TIPO_PRESUPUESTO) AS BUDGET_TYPE,
      CASE WHEN PRE.ESTADO = TRUE THEN 'Abierto' ELSE 'Cerrado' END AS STATUS
    FROM ${TABLE} PRE
    JOIN ${PROJECT_TABLE} PRO
    ON PRO.PK_PROYECTO = PRE.FK_PROYECTO`
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
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
