import postgres from "../../services/postgres.js";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";
import {
  TABLE as BUDGET_TABLE,
} from "./budget.ts";
import {
  TABLE as ROLE_TABLE,
} from "./ROL.ts";
import {
  TABLE as PERSON_TABLE,
} from "../ORGANIZACION/PERSONA.ts";
import {
  TABLE as WEEK_TABLE,
} from "../MAESTRO/dim_semana.ts";
import {
  TABLE as CONTROL_TABLE,
} from "./control_semana.ts";

export const TABLE = "OPERACIONES.ASIGNACION";

class Asignacion {
  constructor(
    public readonly id: number,
    public person: number,
    public budget: number,
    public role: number,
    public week: number,
    public date: number,
    public hours: number,
  ) {}

  /*
  * Updates only the hours for each assignation
  * */
  async update(
    hours: number = this.hours,
  ): Promise<
    Asignacion
  > {
    Object.assign(this, {
      hours,
    });

    //TODO
    //Should throw on updating assignation on a closed week
    //Should update possible registry created by it
    await postgres.query(
      `UPDATE ${TABLE} SET
          HORAS = $2
        WHERE PK_ASIGNACION = $1`,
      this.id,
      this.hours,
    );

    return this;
  }

  //TODO
  //Should throw on creating assignation on a closed week
  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_ASIGNACION = $1`,
      this.id,
    );
  }
}

export const findAll = async (): Promise<Asignacion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FK_SEMANA,
      FECHA,
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
  ]) => new Asignacion(...row));
};

export const findById = async (id: number): Promise<Asignacion | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ASIGNACION,
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FK_SEMANA,
      FECHA,
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
  ] = rows[0];

  return new Asignacion(...result);
};

//TODO
//Should throw on creating assignation on a closed week
export const createNew = async (
  person: number,
  budget: number,
  role: number,
  date: number,
  hours: number,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_PRESUPUESTO,
      FK_ROL,
      FK_SEMANA,
      FECHA,
      HORAS
    ) VALUES (
      $1,
      $2,
      $3,
      (
      SELECT PK_SEMANA
      FROM ${WEEK_TABLE}
      WHERE TO_DATE($4::VARCHAR, 'YYYYMMDD') BETWEEN FECHA_INICIO AND FECHA_FIN
      ),
      $4::INTEGER,
      $5
    ) RETURNING PK_ASIGNACION, FK_SEMANA`,
    person,
    budget,
    role,
    date,
    hours,
  );

  const [id, week]: [number, number] = rows[0];

  return new Asignacion(
    id,
    person,
    budget,
    role,
    week,
    date,
    hours,
  );
};

interface AvailableWeeks {
  code: number;
  date: number;
}

/*
* Returns the week code and start date of the weeks available for assignation
* */
export const getAvailableWeeks = async (): Promise<AvailableWeeks[]> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_SEMANA AS WEEK_CODE,
      TO_CHAR(FECHA_INICIO, 'YYYYMMDD')::INTEGER AS WEEK_DATE
    FROM ${TABLE} A
    JOIN ${WEEK_TABLE} S
      ON A.FK_SEMANA = S.PK_SEMANA
    WHERE FECHA >= (
      SELECT 
        COALESCE(
        MIN(TO_CHAR(S.FECHA_INICIO, 'YYYYMMDD')::INTEGER),
        (SELECT MIN(FECHA) FROM ${TABLE})
        )
      FROM ${CONTROL_TABLE} C
      JOIN ${WEEK_TABLE} S
        ON C.FK_SEMANA = S.PK_SEMANA	
      WHERE C.BAN_CERRADO = FALSE
    )
    GROUP BY
      WEEK_CODE,
      WEEK_DATE
    ORDER BY
      WEEK_DATE`,
  );

  return rows.map(([code, date]: [number, number]) => ({
    code,
    date,
  } as AvailableWeeks));
};

//TODO
//Refactor for new table structure
//Replace week date with week code
class TableData {
  constructor(
    public id: number,
    public id_week: number,
    public id_project: number,
    public person: string,
    public role: string,
    public date: string,
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
      PK_ASIGNACION AS ID,
      S.PK_SEMANA AS ID_WEEK,
      (SELECT FK_PROYECTO FROM ${BUDGET_TABLE} WHERE PK_PRESUPUESTO = A.FK_PRESUPUESTO) AS ID_PROJECT,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = A.FK_PERSONA) AS PERSON,
      (SELECT NOMBRE FROM ${ROLE_TABLE} WHERE PK_ROL = A.FK_ROL) AS ROLE,
      TO_CHAR(TO_DATE(A.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      HORAS AS HOURS
    FROM ${TABLE} AS A
    JOIN ${WEEK_TABLE} AS S
      ON A.FK_SEMANA = S.PK_SEMANA`
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
    number,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
