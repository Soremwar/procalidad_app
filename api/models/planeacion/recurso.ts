import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

import {
  createNew as createDetail,
  deleteByResource as deleteDetails,
} from "./recurso_detalle.ts";

// @deno-types="https://deno.land/x/types/moment/v2.26.0/moment.d.ts"
import moment from 'https://cdn.pika.dev/moment@2.26.0';

const TABLE = "PLANEACION.RECURSO";

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
  ) { }

  async update(
    fk_persona: number = this.fk_persona,
    fk_presupuesto: number = this.fk_presupuesto,
    fk_rol: number = this.fk_rol,
    fecha_inicio: number = this.fecha_inicio,
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

    const is_available = await validateAssignationAvailability(
      this.fk_persona,
      horas_diarias,
      this.fecha_inicio,
      this.fecha_fin
    )
      .then((x) => !x.length);

    if(!is_available) throw new Error("La asignacion no se encuentra disponible en el periodo especificado");

    const { rows } = await postgres.query(
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

    const start = moment(this.fecha_inicio, 'YYYYMMDD');
    const end = moment(this.fecha_fin, 'YYYYMMDD');

    for(
      let x = start;
      x.isSameOrBefore(end);
      x.add(1, 'day')
    ){
      try{
        await createDetail(
          this.pk_recurso,
          Number(x.format('YYYYMMDD')),
          horas_diarias,
        );
      }catch(e){
        throw(e);
        break;
      }
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
      (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)),
      (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO),
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
  ]) => new Recurso(...row));

  return models;
};

export const findById = async (id: number): Promise<Recurso | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_RECURSO,
      FK_PERSONA,
      (SELECT FK_CLIENTE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)),
      (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO),
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

  const is_available = await validateAssignationAvailability(fk_persona, horas_diarias, fecha_inicio, fecha_fin)
    .then((x) => !x.length);

  if(!is_available) throw new Error("La asignacion no se encuentra disponible en el periodo especificado");

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

  const start = moment(fecha_inicio, 'YYYYMMDD');
  const end = moment(fecha_fin, 'YYYYMMDD');

  for(
    let x = start;
    x.isSameOrBefore(end);
    x.add(1, 'day')
  ){
    try{
      await createDetail(
        id,
        Number(x.format('YYYYMMDD')),
        horas_diarias,
      );
    }catch(e){
      await recurso.delete();
      throw(e);
      break;
    }
  }

  return recurso;
};

const validateAssignationAvailability = async (
  person: number,
  daily_hours: number,
  start_date: number,
  end_date: number,
): Promise<[string, string]> => {
  const { rows } = await postgres.query(
    `SELECT
      RD.FECHA,
      SUM(RD.HORAS) + $2::NUMERIC
    FROM
      PLANEACION.RECURSO_DETALLE RD
    JOIN PLANEACION.RECURSO R
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

  return rows;
};

class TableData {
  constructor(
    public id: number,
    public person: string,
    public role: string,
    public start_date: string,
    public end_date: string,
    public assignation: string,
    public hours: number,
  ) { }
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
): Promise<TableData[]> => {

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (
    SELECT
      PK_RECURSO,
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM OPERACIONES.ROL WHERE PK_ROL = FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(CAST(FECHA_INICIO AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(FECHA_FIN AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      PORCENTAJE||'%' AS ASSIGNATION,
      HORAS AS HOURS
    FROM ${TABLE}) AS TOTAL` +
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
    string,
    string,
    string,
    string,
    string,
    number,
  ]) => new TableData(...x));

  return models;
};

class ResourceTableData {
  constructor(
    public id: number,
    public person: string,
    public start_date: string,
    public end_date: string,
    public hours: number,
  ) { }
}

export const getResourceTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
): Promise<ResourceTableData[]> => {

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (
    SELECT
      FK_PERSONA,
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      TO_CHAR(TO_DATE(CAST(MIN(FECHA_INICIO) AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(MAX(FECHA_FIN) AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      SUM(HORAS) AS HOURS
    FROM ${TABLE}
    GROUP BY FK_PERSONA
    ) AS TOTAL` +
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
    string,
    string,
    string,
    number,
  ]) => new ResourceTableData(...x));

  return models;
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
  ) { }
}

export const getDetailTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: {[key: string]: string},
): Promise<DetailTableData[]> => {

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (
    SELECT
      PK_RECURSO,
      FK_PERSONA AS ID_PERSON,
      (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)) AS PROJECT,
      TO_CHAR(TO_DATE(CAST(FECHA_INICIO AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(TO_DATE(CAST(FECHA_FIN AS VARCHAR), 'YYYYMMDD'), 'YYYY-MM-DD') AS END_DATE,
      PORCENTAJE||'%' AS ASSIGNATION,
      HORAS AS HOURS
    FROM ${TABLE}) AS TOTAL` +
    " " +
    (Object.values(order).length
      ? `ORDER BY ${Object.entries(order).map(([column, order]) =>
        `${column} ${order}`
      ).join(", ")}`
      : "") +
    " " +
    (Object.keys(search).length
      ? `WHERE ${Object.entries(search).map(([column, value]) => (
        `CAST(${column} AS VARCHAR) ILIKE '${value}'`  
      )).join(' AND ')}`
      : '') +
    " " +
    (rows ? `OFFSET ${rows * page} LIMIT ${rows}` : "");

  const { rows: result } = await postgres.query(query);

  const models = result.map((x: [
    number,
    number,
    number,
    string,
    string,
    string,
    string,
    number,
  ]) => new DetailTableData(...x));

  return models;
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
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      MIN(FECHA_INICIO) AS START_DATE,
      MAX(FECHA_FIN) AS END_DATE,
      SUM(HORAS) AS HOURS
    FROM ${TABLE}
    GROUP BY FK_PERSONA`
  );

  const data = rows.map((row: [
    string,
    string,
    string,
    number,
  ]) => new ResourceGanttData(...row));

  return data;
}

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
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM OPERACIONES.PROYECTO WHERE PK_PROYECTO = (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO)) AS PROJECT,
      (SELECT NOMBRE FROM OPERACIONES.ROL WHERE PK_ROL = FK_ROL) AS ROLE,
      FECHA_INICIO,
      FECHA_FIN,
      PORCENTAJE,
      HORAS
    FROM ${TABLE}
    ${person
      ? `WHERE FK_PERSONA = ${person}`
      : project
        ? `WHERE (SELECT FK_PROYECTO FROM OPERACIONES.PRESUPUESTO WHERE PK_PRESUPUESTO = FK_PRESUPUESTO) = ${project}`
        : ''
    }`
  );

  const data = rows.map((row: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ]) => new DetailGanttData(...row));

  return data;
}
