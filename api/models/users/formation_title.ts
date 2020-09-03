import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import {
  TABLE as GENERIC_FILE_TABLE,
} from "../files/generic_file.ts";
import {
  FormationType,
  TABLE as FORMATION_LEVEL_TABLE,
} from "./formation_level.ts";
import {
  TABLE as PEOPLE_TABLE,
} from "../ORGANIZACION/people.ts";

export const TABLE = "USUARIOS.FORMACION";

class FormationTitle {
  constructor(
    public readonly id: number,
    public readonly formation_level: number,
    public title: string,
    public institution: string,
    public start_date: string,
    public end_date: string | null,
    public city: number | null,
    public generic_file: number | null,
    public teacher: number | null,
    public status: boolean,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_FORMACION = $1`,
      this.id,
    );
  }

  async update(
    institution: string = this.institution,
    start_date: string = this.start_date,
    end_date: string | null = this.end_date,
    city: number | null = this.city,
    generic_file: number | null = this.generic_file,
    teacher: number | null = this.teacher,
    status: boolean = this.status,
  ): Promise<FormationTitle> {
    Object.assign(this, {
      institution,
      start_date,
      end_date,
      city,
      generic_file,
      teacher,
      status,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        INSTITUCION = $2,
        FECHA_INICIO = $3,
        FECHA_FIN = $4,
        FK_CIUDAD = $5,
        FK_PLANTILLA_ARCHIVO = $6,
        FK_INSTRUCTOR = $7,
        ESTADO = $8
      WHERE PK_FORMACION = $1`,
      this.id,
      this.institution,
      this.start_date,
      this.end_date,
      this.city,
      this.generic_file,
      this.teacher,
      this.status,
    );

    return this;
  }
}

export const create = async (
  formation_level: number,
  title: string,
  institution: string,
  start_date: string,
  end_date: string | null,
  city: number | null,
  teacher: number | null,
  status: boolean,
): Promise<FormationTitle> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_NIVEL_FORMACION,
      TITULO,
      INSTITUCION,
      FECHA_INICIO,
      FECHA_FIN,
      FK_CIUDAD,
      FK_INSTRUCTOR,
      ESTADO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    ) RETURNING PK_FORMACION`,
    formation_level,
    title,
    institution,
    start_date,
    end_date,
    city,
    teacher,
    status,
  );

  const id: number = rows[0][0];

  return new FormationTitle(
    id,
    formation_level,
    title,
    institution,
    start_date,
    end_date,
    city,
    null,
    teacher,
    status,
  );
};

export const getAll = async (
  formation_type: FormationType,
): Promise<FormationTitle[]> => {
  const { rows } = await postgres.query(
    `SELECT
      T.PK_FORMACION,
      T.FK_NIVEL_FORMACION,
      T.TITULO,
      T.INSTITUCION,
      TO_CHAR(FECHA_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FECHA_FIN, 'YYYY-MM-DD'),
      T.FK_CIUDAD,
      T.FK_ARCHIVO_GENERICO,
      T.FK_INSTRUCTOR,
      T.ESTADO
     FROM ${TABLE} T
     JOIN ${FORMATION_LEVEL_TABLE} L
       ON T.FK_NIVEL_FORMACION = L.PK_NIVEL
     WHERE L.TIPO_FORMACION = '${formation_type}'`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    string,
    string,
    string | null,
    number | null,
    number,
    number | null,
    boolean,
  ]) => new FormationTitle(...row));
};

export const findById = async (
  id: number,
): Promise<FormationTitle | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_FORMACION,
      FK_NIVEL_FORMACION,
      TITULO,
      INSTITUCION,
      TO_CHAR(FECHA_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FECHA_FIN, 'YYYY-MM-DD'),
      FK_CIUDAD,
      FK_ARCHIVO_GENERICO,
      FK_INSTRUCTOR,
      ESTADO
     FROM ${TABLE}
     WHERE PK_FORMACION = $1`,
    id,
  );

  if (!rows.length) return null;

  return new FormationTitle(
    ...rows[0] as [
      number,
      number,
      string,
      string,
      string,
      string | null,
      number | null,
      number,
      number | null,
      boolean,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly formation_level: string,
    public readonly institution: string,
    public readonly title: string,
    public readonly status: string,
    public readonly teacher: string,
    public readonly file: {
      id: number;
      extensions: string[];
    },
    public readonly upload_date: string,
  ) {}
}

export const generateTableData = (
  formation_type: FormationType,
  user_id: number,
) => {
  return async (
    order: TableOrder,
    page: number,
    rows: number | null,
    filters: { [key: string]: string },
    search: { [key: string]: string },
  ): Promise<TableResult> => {
    const base_query = (
      `SELECT
      T.PK_FORMACION AS ID,
      L.NOMBRE AS FORMATION_LEVEL,
      T.INSTITUCION AS INSTITUTION,
      T.TITULO AS TITLE,
      CASE WHEN T.ESTADO = TRUE THEN 'En curso' ELSE 'Finalizado' END AS STATUS,
      (SELECT NOMBRE FROM ${PEOPLE_TABLE} WHERE PK_PERSONA = FK_INSTRUCTOR) AS TEACHER,
      T.FK_ARCHIVO_GENERICO,
      F.EXTENSIONES,
      F.FEC_CARGA AS UPLOAD_DATE
    FROM ${TABLE} AS T
    JOIN ${FORMATION_LEVEL_TABLE} AS L
      ON T.FK_NIVEL_FORMACION = L.PK_NIVEL
    LEFT JOIN ${GENERIC_FILE_TABLE} AS F
      ON F.PK_ARCHIVO = T.FK_ARCHIVO_GENERICO
      AND F.FK_USUARIO = ${user_id}
    WHERE L.TIPO_FORMACION = '${formation_type}'`
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
      number,
      string[],
      string,
    ]) =>
      new TableData(
        x[0],
        x[1],
        x[2],
        x[3],
        x[4],
        x[5],
        {
          id: x[6],
          extensions: x[7],
        },
        x[8],
      )
    );

    return new TableResult(
      count,
      models,
    );
  };
};
