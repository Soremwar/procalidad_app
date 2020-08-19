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
} from "./recurso_detalle.ts";
import {
  getLaboralDaysBetween,
} from "../MAESTRO/dim_tiempo.ts";
import {
  TABLE as BUDGET_TABLE,
} from "../OPERACIONES/budget.ts";
import {
  TABLE as BUDGET_DETAIL_TABLE,
} from "../OPERACIONES/PRESUPUESTO_DETALLE.ts";
import {
  TABLE as PROJECT_TABLE,
} from "../OPERACIONES/PROYECTO.ts";
import {
  TABLE as ROLE_TABLE,
} from "../OPERACIONES/ROL.ts";
import {
  TABLE as PERSON_TABLE,
} from "../ORGANIZACION/PERSONA.ts";
import {
  TABLE as POSITION_ASSIGNATION_TABLE,
} from "../ORGANIZACION/asignacion_cargo.ts";

export const TABLE = "PLANEACION.RECURSO";

class Recurso {
  constructor(
    public readonly pk_recurso: number,
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
    fk_presupuesto: number,
    fk_rol: number = this.fk_rol,
    fecha_inicio: number,
    fecha_fin: number = this.fecha_fin,
    porcentaje: number = this.porcentaje,
    horas: number = this.horas,
  ): Promise<
    Recurso
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

    await deleteDetails(this.pk_recurso);

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
        WHERE PK_RECURSO = $1`,
      this.pk_recurso,
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
          this.pk_recurso,
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
    await deleteDetails(this.pk_recurso);

    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_RECURSO = $1`,
      this.pk_recurso,
    );
  }
}

export const findAll = async (): Promise<Recurso[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_RECURSO,
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

  return rows.map((row: [
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
  ]) => new Recurso(...row));
};

export const findById = async (id: number): Promise<Recurso | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_RECURSO,
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
    WHERE PK_RECURSO = $1`,
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
  return new Recurso(...result);
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
    RETURNING PK_RECURSO`,
    fk_persona,
    fk_presupuesto,
    fk_rol,
    fecha_inicio,
    fecha_fin,
    porcentaje,
    horas,
  );

  const id: number = rows[0][0];

  const recurso = new Recurso(
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
      ON R.PK_RECURSO = RD.FK_RECURSO
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

export const getProjectTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_RECURSO,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(CAST(FECHA_INICIO AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(FECHA_FIN AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      PORCENTAJE||'%' AS ASSIGNATION,
      TO_CHAR(HORAS, 'FM999999999.0') AS HOURS
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

class ResourceTableData {
  constructor(
    public id: number,
    public person: string,
    public start_date: string,
    public end_date: string,
    public hours: number,
  ) {}
}

export const getResourceTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      FK_PERSONA,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      TO_CHAR(TO_DATE(CAST(MIN(FECHA_INICIO) AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(MAX(FECHA_FIN) AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      TO_CHAR(SUM(HORAS), 'FM999999999.0') AS HOURS
    FROM ${TABLE}
    GROUP BY FK_PERSONA`
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
    number,
  ]) => new ResourceTableData(...x));

  return new TableResult(
    count,
    models,
  );
};

class DetailTableData {
  constructor(
    public id: number,
    public id_person: number,
    public id_project: number,
    public project: string,
    public start_date: string,
    public end_date: string,
    public assignation: string,
    public hours: number,
  ) {}
}

export const getDetailTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_RECURSO,
      FK_PERSONA AS ID_PERSON,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PROJECT_TABLE} WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)) AS PROJECT,
      TO_CHAR(TO_DATE(CAST(FECHA_INICIO AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(FECHA_FIN AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      PORCENTAJE||'%' AS ASSIGNATION,
      TO_CHAR(HORAS, 'FM999999999.0') AS HOURS
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
    number,
    string,
    string,
    string,
    string,
    number,
  ]) => new DetailTableData(...x));

  return new TableResult(
    count,
    models,
  );
};

class ProjectGanttData {
  constructor(
    public person: string,
    public role: string,
    public start_date: number,
    public end_date: number,
    public assignation: number,
    public hours: number,
  ) {}
}

export const getProjectGanttData = async (
  project: number,
): Promise<ProjectGanttData[]> => {
  const { rows } = await postgres.query(
    `SELECT
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = FK_ROL) AS ROLE,
      FECHA_INICIO,
      FECHA_FIN,
      PORCENTAJE,
      HORAS
    FROM ${TABLE}
    WHERE (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) = ${project}`,
  );

  return rows.map((row: [
    string,
    string,
    number,
    number,
    number,
    number,
  ]) => new ProjectGanttData(...row));
};

class ResourceGanttData {
  constructor(
    public person: string,
    public start_date: string,
    public end_date: string,
    public hours: number,
  ) {}
}

export const getResourceGanttData = async (): Promise<ResourceGanttData[]> => {
  const { rows } = await postgres.query(
    `SELECT
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      MIN(FECHA_INICIO) AS START_DATE,
      MAX(FECHA_FIN) AS END_DATE,
      SUM(HORAS) AS HOURS
    FROM ${TABLE}
    GROUP BY FK_PERSONA`,
  );

  return rows.map((row: [
    string,
    string,
    string,
    number,
  ]) => new ResourceGanttData(...row));
};

class DetailGanttData {
  constructor(
    public person: string,
    public project: string,
    public role: string,
    public start_date: string,
    public end_date: string,
    public assignation: string,
    public hours: string,
  ) {}
}

export const getDetailGanttData = async (
  person?: number,
  project?: number,
): Promise<DetailGanttData[]> => {
  const { rows } = await postgres.query(
    `SELECT
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${PROJECT_TABLE} WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)) AS PROJECT,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = FK_ROL) AS ROLE,
      FECHA_INICIO,
      FECHA_FIN,
      PORCENTAJE,
      HORAS
    FROM ${TABLE}
    ${
      person ? `WHERE FK_PERSONA = ${person}` : project
      ? `WHERE (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) = ${project}`
      : ""
    }`,
  );

  return rows.map((row: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ]) => new DetailGanttData(...row));
};

//TODO
//Remove laboral hours constant and make personal calculation
const LABORAL_HOURS = 9;

class DetailHeatmapDate {
  constructor(
    public project_id: number,
    public date: number,
    public hours: number,
    public assignation: number,
  ) {}
}

class DetailHeatmapData {
  constructor(
    public project_id: number,
    public project: string,
    public dates: DetailHeatmapDate[],
  ) {}

  addDate(date: DetailHeatmapDate) {
    this.dates.push(date);
  }
}

export const getDetailHeatmapData = async (
  person: number,
): Promise<DetailHeatmapData[]> => {
  const { rows: dates } = await postgres.query(
    `SELECT
      PRE.FK_PROYECTO,
      RD.FECHA,
      SUM(RD.HORAS),
      TO_CHAR(SUM(RD.HORAS) / ${LABORAL_HOURS} * 100, '000.99')
    FROM
      ${TABLE} AS R 
    JOIN
      ${DETAIL_TABLE} AS RD
      ON R.PK_RECURSO = RD.FK_RECURSO
    JOIN
      ${BUDGET_TABLE} PRE
      ON PRE.PK_PRESUPUESTO = R.FK_PRESUPUESTO
    WHERE
      R.FK_PERSONA = $1
    AND
      TO_DATE(CAST(RD.FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 MONTHS'
    GROUP BY 
      PRE.FK_PROYECTO,
      RD.FECHA
    ORDER BY
      RD.FECHA`,
    person,
  );

  const { rows: raw_projects } = await postgres.query(
    `SELECT
      PRO.PK_PROYECTO,
      PRO.NOMBRE
    FROM
      ${TABLE} AS R
    JOIN
      ${BUDGET_TABLE} AS PRE
      ON R.FK_PRESUPUESTO = PRE.PK_PRESUPUESTO
    JOIN
      ${PROJECT_TABLE} AS PRO
      ON PRE.FK_PROYECTO = PRO.PK_PROYECTO
    WHERE
      PK_RECURSO IN (
        SELECT DISTINCT FK_RECURSO
        FROM ${DETAIL_TABLE}
        WHERE
          TO_DATE(CAST(FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 MONTHS'
      )
    AND
      R.FK_PERSONA = $1
    GROUP BY
      PRO.PK_PROYECTO,
      PRO.NOMBRE`,
    person,
  );

  const projects: DetailHeatmapData[] = raw_projects.map((project: [
    number,
    string,
  ]) =>
    new DetailHeatmapData(
      project[0],
      project[1],
      [],
    )
  );

  dates
    .map((row: [
      number,
      number,
      number,
      number,
    ]) => new DetailHeatmapDate(...row))
    .forEach((x: DetailHeatmapDate) => {
      const project = projects.find((project) =>
        project.project_id === x.project_id
      );
      if (project) {
        project.addDate(x);
      }
    });

  return projects;
};

class ResourceHeatmapDate {
  constructor(
    public person_id: number,
    public date: number,
    public hours: number,
    public assignation: number,
  ) {}
}

class ResourceHeatmapData {
  constructor(
    public person_id: number,
    public person: string,
    public dates: ResourceHeatmapDate[],
  ) {}

  addDate(date: ResourceHeatmapDate) {
    this.dates.push(date);
  }
}

export enum HeatmapFormula {
  occupation = "occupation",
  availability = "availability",
}

export const getResourceHeatmapData = async (
  formula: HeatmapFormula,
  sub_area?: number,
  position?: number,
  role?: number,
): Promise<ResourceHeatmapData[]> => {
  const { rows: dates } = await postgres.query(
    `SELECT
      R.FK_PERSONA,
      RD.FECHA,
      ${
      formula === "occupation"
        ? `SUM(RD.HORAS)`
        : `ABS(SUM(RD.HORAS) - ${LABORAL_HOURS})`
    }::NUMERIC,
      ${
      formula === "occupation"
        ? `TO_CHAR(SUM(RD.HORAS) / ${LABORAL_HOURS} * 100, '000.99')`
        : `TO_CHAR(ABS(SUM(RD.HORAS) - ${LABORAL_HOURS}) / ${LABORAL_HOURS} * 100, '000.99')`
    }::NUMERIC
    FROM ${DETAIL_TABLE} AS RD
    JOIN ${TABLE} AS R
      ON RD.FK_RECURSO = R.PK_RECURSO
    JOIN ${POSITION_ASSIGNATION_TABLE} AS AC
      ON AC.FK_PERSONA = R.FK_PERSONA
    WHERE
      TO_DATE(CAST(RD.FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 months'
    ${sub_area ? `AND AC.FK_SUB_AREA = ${sub_area}` : ""}
    ${position ? `AND AC.FK_CARGO = ${position}` : ""}
    ${role ? `AND ${role} = ANY(AC.FK_ROLES)` : ""}
    GROUP BY
      R.FK_PERSONA,
      RD.FECHA
    ORDER BY RD.FECHA`,
  );

  const { rows: raw_people } = await postgres.query(
    `SELECT
      R.FK_PERSONA,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = R.FK_PERSONA)
    FROM ${TABLE} AS R
    JOIN ${POSITION_ASSIGNATION_TABLE} AS AC
      ON AC.FK_PERSONA = R.FK_PERSONA
    WHERE
      R.PK_RECURSO IN (
        SELECT DISTINCT FK_RECURSO
        FROM ${DETAIL_TABLE}
        WHERE
          TO_DATE(CAST(FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 months'
      )
    ${sub_area ? `AND AC.FK_SUB_AREA = ${sub_area}` : ""}
    ${position ? `AND AC.FK_CARGO = ${position}` : ""}
    ${role ? `AND ${role} = ANY(AC.FK_ROLES)` : ""}
    GROUP BY
      R.FK_PERSONA,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = R.FK_PERSONA)
    ORDER BY
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = R.FK_PERSONA)`,
  );

  const people: ResourceHeatmapData[] = raw_people.map((person: [
      number,
      string,
    ]) =>
      new ResourceHeatmapData(
        person[0],
        person[1],
        [],
      )
  );

  dates
    .map((row: [
      number,
      number,
      number,
      number,
    ]) => new ResourceHeatmapDate(...row))
    .forEach((x: ResourceHeatmapDate) => {
      const person = people.find((person) => person.person_id === x.person_id);
      if (person) {
        person.addDate(x);
      }
    });

  return people;
};
