import postgres from "../../services/postgres.js";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

import {
  createNew as createDetail,
  deleteByResource as deleteDetails,
  TABLE as DETAIL_TABLE,
} from "./asignacion_detalle.ts";
import {
  getLaboralDaysBetween,
} from "../MAESTRO/dim_tiempo.ts";
import {
  TABLE as BUDGET_TABLE,
} from "../OPERACIONES/PRESUPUESTO.ts";
import {
  TABLE as PROJECT_TABLE,
} from "../OPERACIONES/PROYECTO.ts";
import {
  TABLE as ROLE_TABLE,
} from "../OPERACIONES/ROL.ts";
import {
  TABLE as PERSON_TABLE,
} from "../ORGANIZACION/PERSONA.ts";

const TABLE = "ASIGNACION.ASIGNACION";

class Asignacion {
  constructor(
    public readonly pk_asignacion: number,
    public fk_persona: number,
    public fk_cliente: number | undefined,
    public fk_proyecto: number | undefined,
    public fk_presupuesto: number,
    public fk_rol: number,
    public fecha_inicio: number,
    public fecha_fin: number,
    public porcentaje: number,
    public horas: number,
  ) {}

  async update(
    fk_persona: number = this.fk_persona,
    fk_presupuesto: number = this.fk_presupuesto,
    fk_rol: number = this.fk_rol,
    fecha_inicio: number = this.fecha_inicio,
    fecha_fin: number = this.fecha_fin,
    porcentaje: number = this.porcentaje,
    horas: number = this.horas,
  ): Promise<
    Asignacion
  > {
    Object.assign(this, {
      fk_persona,
      fk_presupuesto,
      fk_rol,
      fecha_inicio,
      fecha_fin,
      porcentaje,
      horas,
    });

    await deleteDetails(this.pk_asignacion);

    //Reemplazar 9 por calculo de horas laborales diarias
    const horas_diarias = (this.porcentaje / 100) * 9;

    const is_available = await assignationIsAvailable(
      this.fk_persona,
      horas_diarias,
      this.fecha_inicio,
      this.fecha_fin,
    );

    if (!is_available) {
      throw new Error(
        "La asignacion no se encuentra disponible en el periodo especificado",
      );
    }

    await postgres.query(
      `UPDATE ${TABLE} SET
          FK_PERSONA = $2,
          FK_PRESUPUESTO = $3,
          FK_ROL = $4,
          FECHA_INICIO = $5,
          FECHA_FIN = $6,
          PORCENTAJE = $7,
          HORAS = $8
        WHERE PK_ASIGNACION = $1`,
      this.pk_asignacion,
      this.fk_persona,
      this.fk_presupuesto,
      this.fk_rol,
      this.fecha_inicio,
      this.fecha_fin,
      this.porcentaje,
      this.horas,
    );

    const days: number[] = await getLaboralDaysBetween(
      this.fecha_inicio,
      this.fecha_fin,
    );

    try {
      for (const day of days) {
        await createDetail(
          this.pk_asignacion,
          day,
          horas_diarias,
        );
      }
    } catch (e) {
      await this.delete();
      throw (e);
    }

    return this;
  }

  async delete(): Promise<void> {
    await deleteDetails(this.pk_asignacion);

    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_ASIGNACION = $1`,
      this.pk_asignacion,
    );
  }
}

export const findAll = async (): Promise<Asignacion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      (SELECT FK_CLIENTE FROM ${PROJECT_TABLE} WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)),
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO),
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA_INICIO,
      FECHA_FIN,
      PORCENTAJE,
      HORAS
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]) => new Asignacion(...row));

  return models;
};

export const findById = async (id: number): Promise<Asignacion | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      (SELECT FK_CLIENTE FROM ${PROJECT_TABLE} WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)),
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO),
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA_INICIO,
      FECHA_FIN,
      PORCENTAJE,
      HORAS
    FROM ${TABLE}
    WHERE PK_ASIGNACION = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = rows[0];
  return new Asignacion(...result);
};

export const createNew = async (
  fk_persona: number,
  fk_presupuesto: number,
  fk_rol: number,
  fecha_inicio: number,
  fecha_fin: number,
  porcentaje: number,
  horas: number,
) => {
  //Reemplazar 9 por calculo de horas laborales diarias
  const horas_diarias = (porcentaje / 100) * 9;

  const is_available = await assignationIsAvailable(
    fk_persona,
    horas_diarias,
    fecha_inicio,
    fecha_fin,
  );

  if (!is_available) {
    throw new Error(
      "La asignacion no se encuentra disponible en el periodo especificado",
    );
  }

  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FECHA_INICIO,
      FECHA_FIN,
      PORCENTAJE,
      HORAS
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING PK_ASIGNACION`,
    fk_persona,
    fk_presupuesto,
    fk_rol,
    fecha_inicio,
    fecha_fin,
    porcentaje,
    horas,
  );

  const id: number = rows[0][0];

  const recurso = new Asignacion(
    id,
    fk_persona,
    undefined,
    undefined,
    fk_presupuesto,
    fk_rol,
    fecha_inicio,
    fecha_fin,
    porcentaje,
    horas,
  );

  const days: number[] = await getLaboralDaysBetween(fecha_inicio, fecha_fin);

  try {
    for (const day of days) {
      await createDetail(
        id,
        day,
        horas_diarias,
      );
    }
  } catch (e) {
    await recurso.delete();
    throw (e);
  }

  return recurso;
};

const assignationIsAvailable = async (
  person: number,
  daily_hours: number,
  start_date: number,
  end_date: number,
): Promise<Boolean> => {
  const { rows } = await postgres.query(
    `SELECT
      RD.FECHA,
      SUM(RD.HORAS) + $2::NUMERIC
    FROM
      ${DETAIL_TABLE} RD
    JOIN ${TABLE} R
      ON R.PK_ASIGNACION = RD.FK_ASIGNACION
    WHERE RD.FECHA BETWEEN $3::INTEGER AND $4::INTEGER
    AND R.FK_PERSONA = $1
    GROUP BY RD.FECHA
    HAVING SUM(RD.HORAS) + $2::NUMERIC > 9`,
    person,
    daily_hours,
    start_date,
    end_date,
  );

  return !rows.length;
};

class TableData {
  constructor(
    public id: number,
    public id_project: number,
    public person: string,
    public role: string,
    public start_date: string,
    public end_date: string,
    public assignation: string,
    public hours: number,
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
      PK_ASIGNACION,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(CAST(FECHA_INICIO AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(FECHA_FIN AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      PORCENTAJE||'%' AS ASSIGNATION,
      HORAS AS HOURS
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
    number,
    string,
    string,
    string,
    string,
    string,
    number,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
