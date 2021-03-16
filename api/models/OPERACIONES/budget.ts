import { queryArray, queryObject } from "../../services/postgres.ts";
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
  "FK_CLIENTE",
  "FK_PROYECTO",
  "FK_TIPO_PRESUPUESTO",
  "NOMBRE",
  "DESCRIPCION",
  "ESTADO",
  "COSTO_DIRECTO",
  "COSTO_TERCEROS",
  "COSTO_IMPREVISTO",
  "FACTOR_PRODUCTIVIDAD",
];

class Budget implements BudgetInterface {
  roles = [];

  constructor(
    public readonly pk_presupuesto: number,
    public fk_cliente: number | undefined,
    public readonly fk_proyecto: number,
    public fk_tipo_presupuesto: number,
    public nombre: string,
    public descripcion: string,
    public estado: boolean,
    public costo_directo: number,
    public costo_terceros: number,
    public costo_imprevisto: number,
    public factor_productividad: number,
  ) {}

  async update(
    fk_tipo_presupuesto = this.fk_tipo_presupuesto,
    nombre = this.nombre,
    descripcion = this.descripcion,
    nuevo_estado = this.estado,
    costo_directo = this.costo_directo,
    costo_terceros = this.costo_terceros,
    costo_imprevisto = this.costo_imprevisto,
    factor_productividad = this.factor_productividad,
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
      costo_directo,
      costo_terceros,
      costo_imprevisto,
      factor_productividad,
    });

    await queryArray(
      `UPDATE ${TABLE} SET
        FK_PROYECTO = $2,
        FK_TIPO_PRESUPUESTO = $3,
        NOMBRE = $4,
        DESCRIPCION = $5,
        ESTADO = $6,
        COSTO_DIRECTO = $7,
        COSTO_TERCEROS = $8,
        COSTO_IMPREVISTO = $9,
        FACTOR_PRODUCTIVIDAD = $10
      WHERE PK_PRESUPUESTO = $1`,
      this.pk_presupuesto,
      this.fk_proyecto,
      this.fk_tipo_presupuesto,
      this.nombre,
      this.descripcion,
      nuevo_estado ?? this.estado,
      this.costo_directo,
      this.costo_terceros,
      this.costo_imprevisto,
      this.factor_productividad,
    );

    return this;
  }

  async delete(): Promise<void> {
    await queryArray(
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
        0,
        FK_PROYECTO,
        FK_TIPO_PRESUPUESTO,
        NOMBRE,
        DESCRIPCION,
        ESTADO,
        COSTO_DIRECTO,
        COSTO_TERCEROS,
        COSTO_IMPREVISTO,
        FACTOR_PRODUCTIVIDAD
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
      row.costo_directo,
      row.costo_terceros,
      row.costo_imprevisto,
      row.factor_productividad,
    )
  );
};

export const findById = async (id: number): Promise<Budget | null> => {
  const { rows } = await queryObject<BudgetInterface>({
    text: (
      `SELECT
        PK_PRESUPUESTO,
        (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = FK_PROYECTO) AS FK_CLIENTE,
        FK_PROYECTO,
        FK_TIPO_PRESUPUESTO,
        NOMBRE,
        DESCRIPCION,
        ESTADO,
        COSTO_DIRECTO,
        COSTO_TERCEROS,
        COSTO_IMPREVISTO,
        FACTOR_PRODUCTIVIDAD
      FROM ${TABLE}
      WHERE PK_PRESUPUESTO = $1`
    ),
    fields,
    args: [id],
  });

  if (!rows.length) return null;

  return new Budget(
    rows[0].pk_presupuesto,
    rows[0].fk_cliente,
    rows[0].fk_proyecto,
    rows[0].fk_tipo_presupuesto,
    rows[0].nombre,
    rows[0].descripcion,
    rows[0].estado,
    rows[0].costo_directo,
    rows[0].costo_terceros,
    rows[0].costo_imprevisto,
    rows[0].factor_productividad,
  );
};

/*
* Works under the premise that only one budget can be open at a time
* for a given project. If that were to change this whole system would have
* to be reformulated
* */
export const findOpenBudgetByProject = async (
  project: number,
): Promise<Budget | null> => {
  const { rows } = await queryObject<BudgetInterface>({
    text: (
      `SELECT
        PK_PRESUPUESTO,
        (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = FK_PROYECTO) AS FK_CLIENTE,
        FK_PROYECTO,
        FK_TIPO_PRESUPUESTO,
        NOMBRE,
        DESCRIPCION,
        ESTADO,
        COSTO_DIRECTO,
        COSTO_TERCEROS,
        COSTO_IMPREVISTO,
        FACTOR_PRODUCTIVIDAD
      FROM ${TABLE}
      WHERE FK_PROYECTO = $1
      AND ESTADO = TRUE`
    ),
    args: [project],
    fields,
  });

  if (!rows[0]) return null;

  return new Budget(
    rows[0].pk_presupuesto,
    rows[0].fk_cliente,
    rows[0].fk_proyecto,
    rows[0].fk_tipo_presupuesto,
    rows[0].nombre,
    rows[0].descripcion,
    rows[0].estado,
    rows[0].costo_directo,
    rows[0].costo_terceros,
    rows[0].costo_imprevisto,
    rows[0].factor_productividad,
  );
};

export const createNew = async (
  fk_proyecto: number,
  fk_tipo_presupuesto: number,
  nombre: string,
  descripcion: string,
  abierto: boolean,
  costo_directo: number,
  costo_terceros: number,
  costo_imprevisto: number,
  factor_productividad: number,
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

  const { rows } = await queryArray(
    `INSERT INTO ${TABLE} (
      FK_PROYECTO,
      FK_TIPO_PRESUPUESTO,
      NOMBRE,
      DESCRIPCION,
      ESTADO,
      COSTO_DIRECTO,
      COSTO_TERCEROS,
      COSTO_IMPREVISTO,
      FACTOR_PRODUCTIVIDAD
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9
    ) RETURNING PK_PRESUPUESTO`,
    fk_proyecto,
    fk_tipo_presupuesto,
    nombre,
    descripcion,
    abierto,
    costo_directo,
    costo_terceros,
    costo_imprevisto,
    factor_productividad,
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
