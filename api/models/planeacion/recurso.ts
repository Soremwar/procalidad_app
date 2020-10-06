import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import {
  createNew as createDetail,
  deleteByResource as deleteDetails,
  TABLE as DETAIL_TABLE,
} from "./recurso_detalle.ts";
import { getLaboralDaysBetween } from "../MAESTRO/dim_tiempo.ts";
import { TABLE as BUDGET_TABLE } from "../OPERACIONES/budget.ts";
import { TABLE as PROJECT_TABLE } from "../OPERACIONES/PROYECTO.ts";
import { TABLE as ROLE_TABLE } from "../OPERACIONES/ROL.ts";
import { TABLE as PEOPLE_TABLE } from "../ORGANIZACION/people.ts";
import {
  TABLE as POSITION_ASSIGNATION_TABLE,
} from "../ORGANIZACION/asignacion_cargo.ts";
import { TABLE as SUB_AREA_TABLE } from "../ORGANIZACION/sub_area.ts";
import { TABLE as AREA_TABLE } from "../ORGANIZACION/AREA.ts";
import { TABLE as AREA_TYPE_TABLE } from "../ORGANIZACION/area_type.ts";

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

class ProjectTableData {
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
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PL.PK_RECURSO AS ID,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = PL.FK_PRESUPUESTO) AS ID_PROJECT,
      P.NOMBRE AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = PL.FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(CAST(PL.FECHA_INICIO AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(PL.FECHA_FIN AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      PL.PORCENTAJE||' %' AS ASSIGNATION,
      TO_CHAR(PL.HORAS, 'FM999999999.0') AS HOURS
    FROM ${TABLE} PL
    JOIN ${PEOPLE_TABLE} AS P
      ON PL.FK_PERSONA = P.PK_PERSONA
    WHERE COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE`
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
    number,
    string,
    string,
    string,
    string,
    string,
    number,
  ]) => new ProjectTableData(...x));

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
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      P.PK_PERSONA AS ID,
      P.NOMBRE AS PERSON,
      TO_CHAR(TO_DATE(CAST(MIN(PL.FECHA_INICIO) AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(MAX(PL.FECHA_FIN) AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      TO_CHAR(SUM(PL.HORAS), 'FM999999999.0') AS HOURS
    FROM ${TABLE} AS PL
    JOIN ${PEOPLE_TABLE} AS P
      ON PL.FK_PERSONA = P.PK_PERSONA
    WHERE COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
    GROUP BY
      P.PK_PERSONA`
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
  filters: { [key: string]: string },
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
    filters,
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
      P.NOMBRE AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = PL.FK_ROL) AS ROLE,
      PL.FECHA_INICIO,
      PL.FECHA_FIN,
      PL.PORCENTAJE,
      PL.HORAS
    FROM ${TABLE} AS PL
    JOIN ${PEOPLE_TABLE} AS P
      ON PL.FK_PERSONA = P.PK_PERSONA
    WHERE COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
    AND (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = PL.FK_PRESUPUESTO) = ${project}`,
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
      P.NOMBRE AS PERSON,
      MIN(PL.FECHA_INICIO) AS START_DATE,
      MAX(PL.FECHA_FIN) AS END_DATE,
      SUM(PL.HORAS) AS HOURS
    FROM ${TABLE} AS PL
    JOIN ${PEOPLE_TABLE} AS P
      ON PL.FK_PERSONA = P.PK_PERSONA
    WHERE COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
    GROUP BY
      P.PK_PERSONA`,
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
      (SELECT NOMBRE FROM ${PEOPLE_TABLE} WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
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

class DetailHeatmapData {
  constructor(
    public project: string,
    public dates: {
      date: number;
      hours: number;
      assignation: number;
    },
  ) {}
}

export const getDetailHeatmapData = async (
  person: number,
): Promise<DetailHeatmapData[]> => {
  const { rows } = await postgres.query(
    // deno-fmt-ignore
    `SELECT
      PR.NOMBRE,
      CASE WHEN PD.FK_PRESUPUESTO IS NULL
        THEN '[]'::JSON
        ELSE JSON_AGG(
          JSON_BUILD_OBJECT(
            'date', PD.FECHA,
            'hours', TO_CHAR(PD.HORAS, '0.99')::NUMERIC,
            'assignation', TO_CHAR(PD.HORAS / ${LABORAL_HOURS} * 100, '990.99')::NUMERIC
          )
        ) END
    FROM (
      SELECT
        R.FK_PRESUPUESTO AS FK_PRESUPUESTO,
        RD.FECHA AS FECHA,
        SUM(RD.HORAS) AS HORAS
      FROM ${DETAIL_TABLE} RD
      JOIN ${TABLE} R
        ON R.PK_RECURSO = RD.FK_RECURSO
      WHERE TO_DATE(CAST(RD.FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 MONTHS'
      AND FK_PERSONA = $1
      GROUP BY
        R.FK_PRESUPUESTO,
        RD.FECHA
      ORDER BY
      RD.FECHA
    ) AS PD
    JOIN ${BUDGET_TABLE} AS P
      ON PD.FK_PRESUPUESTO = P.PK_PRESUPUESTO
    JOIN ${PROJECT_TABLE} AS PR
      ON P.FK_PROYECTO = PR.PK_PROYECTO
    GROUP BY PR.NOMBRE, PD.FK_PRESUPUESTO
    ORDER BY PR.NOMBRE`,
    person,
  );

  const projects: DetailHeatmapData[] = rows.map((project: [
    string,
    {
      date: number;
      hours: number;
      assignation: number;
    },
  ]) =>
    new DetailHeatmapData(
      project[0],
      project[1],
    )
  );

  return projects;
};

class ResourceHeatmapData {
  constructor(
    public person: string,
    public dates: {
      date: number;
      hours: number;
      assignation: number;
    },
  ) {}
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
  const { rows } = await postgres.query(
    // deno-fmt-ignore
    `SELECT
      P.NOMBRE,
      CASE WHEN PD.FK_PERSONA IS NULL
        THEN '[]'::JSON
        ELSE JSON_AGG(
          JSON_BUILD_OBJECT(
            'date', PD.FECHA,
            'hours', TO_CHAR(${
              formula === "occupation" ? `PD.HORAS` : `ABS(PD.HORAS - ${LABORAL_HOURS})`
            }, '0.99')::NUMERIC,
            'assignation', TO_CHAR(${
              formula === "occupation"
                ? `PD.HORAS / ${LABORAL_HOURS} * 100`
                : `ABS(PD.HORAS - ${LABORAL_HOURS}) / ${LABORAL_HOURS} * 100`
            }, '990.99')::NUMERIC
          )
        ) END
    FROM ${PEOPLE_TABLE} P
    LEFT JOIN (
      SELECT
        R.FK_PERSONA AS FK_PERSONA,
        RD.FECHA AS FECHA,
        SUM(RD.HORAS) AS HORAS
      FROM ${DETAIL_TABLE} RD
      JOIN ${TABLE} R
        ON R.PK_RECURSO = RD.FK_RECURSO
      JOIN ${PEOPLE_TABLE} AS P
        ON R.FK_PERSONA = P.PK_PERSONA
      JOIN ${POSITION_ASSIGNATION_TABLE} AS AC
        ON AC.FK_PERSONA = R.FK_PERSONA
      WHERE TO_DATE(CAST(RD.FECHA AS VARCHAR), 'YYYYMMDD') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 MONTHS'
      AND COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
      ${sub_area ? `AND AC.FK_SUB_AREA = ${sub_area}` : ""}
      ${position ? `AND AC.FK_CARGO = ${position}` : ""}
      ${role ? `AND ${role} = ANY(AC.FK_ROLES)` : ""}
      GROUP BY
        R.FK_PERSONA,
        RD.FECHA
      ORDER BY
        RD.FECHA
    ) AS PD
      ON P.PK_PERSONA = PD.FK_PERSONA
    JOIN ${POSITION_ASSIGNATION_TABLE} AS AC
      ON AC.FK_PERSONA = P.PK_PERSONA
    JOIN ${SUB_AREA_TABLE} AS SA
      ON AC.FK_SUB_AREA = SA.PK_SUB_AREA
    JOIN ${AREA_TABLE} AS A
      ON SA.FK_AREA = A.PK_AREA
    JOIN ${AREA_TYPE_TABLE} AS TA
      ON A.FK_TIPO_AREA = TA.PK_TIPO
    WHERE TA.BAN_REGISTRABLE = TRUE
    AND COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
    ${sub_area ? `AND AC.FK_SUB_AREA = ${sub_area}` : ""}
    ${position ? `AND AC.FK_CARGO = ${position}` : ""}
    ${role ? `AND ${role} = ANY(AC.FK_ROLES)` : ""}
    GROUP BY
      P.NOMBRE,
      PD.FK_PERSONA
    ORDER BY
      P.NOMBRE`,
  );

  const people: ResourceHeatmapData[] = rows.map((person: [
    string,
    {
      date: number;
      hours: number;
      assignation: number;
    },
  ]) =>
    new ResourceHeatmapData(
      person[0],
      person[1],
    )
  );

  return people;
};
