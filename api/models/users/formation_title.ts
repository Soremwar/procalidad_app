import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as GENERIC_FILE_TABLE } from "../files/generic_file.ts";
import {
  FormationType,
  TABLE as FORMATION_LEVEL_TABLE,
} from "./formation_level.ts";
import { TABLE as PEOPLE_TABLE } from "../ORGANIZACION/people.ts";

export const TABLE = "USUARIOS.FORMACION";

class FormationTitle {
  constructor(
    public readonly id: number,
    public readonly formation_level: number,
    public readonly user: number,
    public title: string,
    public institution: string | null,
    public start_date: string,
    public end_date: string | null,
    public city: number | null,
    public generic_file: number | null,
    public teacher: number | null,
    public status: boolean,
    public title_is_convalidated: boolean | null,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_FORMACION = $1`,
      this.id,
    );
  }

  async update(
    institution = this.institution,
    start_date: string = this.start_date,
    end_date: string | null = this.end_date,
    city: number | null = this.city,
    generic_file: number | null = this.generic_file,
    teacher: number | null = this.teacher,
    status: boolean = this.status,
    title_is_convalidated: boolean | null = this.title_is_convalidated,
  ): Promise<FormationTitle> {
    Object.assign(this, {
      institution,
      start_date,
      end_date,
      city,
      generic_file,
      teacher,
      status,
      title_is_convalidated,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        INSTITUCION = $2,
        FECHA_INICIO = $3,
        FECHA_FIN = $4,
        FK_CIUDAD = $5,
        FK_ARCHIVO_GENERICO = $6,
        FK_INSTRUCTOR = $7,
        ESTADO = $8,
        BAN_TITULO_CONVALIDADO = $9
      WHERE PK_FORMACION = $1`,
      this.id,
      this.institution,
      this.start_date,
      this.end_date,
      this.city,
      this.generic_file,
      this.teacher,
      this.status,
      this.title_is_convalidated,
    );

    return this;
  }
}

export const create = async (
  formation_level: number,
  user: number,
  title: string,
  institution: string | null,
  start_date: string,
  end_date: string | null,
  city: number | null,
  teacher: number | null,
  status: boolean,
  title_is_convalidated: boolean | null,
): Promise<FormationTitle> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_NIVEL_FORMACION,
      FK_USUARIO,
      TITULO,
      INSTITUCION,
      FECHA_INICIO,
      FECHA_FIN,
      FK_CIUDAD,
      FK_INSTRUCTOR,
      ESTADO,
      BAN_TITULO_CONVALIDADO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    ) RETURNING PK_FORMACION`,
    formation_level,
    user,
    title,
    institution,
    start_date,
    end_date,
    city,
    teacher,
    status,
    title_is_convalidated,
  );

  const id: number = rows[0][0];

  return new FormationTitle(
    id,
    formation_level,
    user,
    title,
    institution,
    start_date,
    end_date,
    city,
    null,
    teacher,
    status,
    title_is_convalidated,
  );
};

export const getAll = async (
  formation_type: FormationType,
  user?: number,
): Promise<FormationTitle[]> => {
  const { rows } = await postgres.query(
    `SELECT
      T.PK_FORMACION,
      T.FK_NIVEL_FORMACION,
      T.FK_USUARIO,
      T.TITULO,
      T.INSTITUCION,
      TO_CHAR(FECHA_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FECHA_FIN, 'YYYY-MM-DD'),
      T.FK_CIUDAD,
      T.FK_ARCHIVO_GENERICO,
      T.FK_INSTRUCTOR,
      T.ESTADO,
      T.BAN_TITULO_CONVALIDADO
     FROM ${TABLE} T
     JOIN ${FORMATION_LEVEL_TABLE} L
       ON T.FK_NIVEL_FORMACION = L.PK_NIVEL
     WHERE L.TIPO_FORMACION = '${formation_type}'
     ${user ? `AND T.FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    string,
    string | null,
    string,
    string | null,
    number | null,
    number,
    number | null,
    boolean,
    boolean | null,
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
      ESTADO,
      BAN_TITULO_CONVALIDADO
     FROM ${TABLE}
     WHERE PK_FORMACION = $1`,
    id,
  );

  if (!rows.length) return null;

  return new FormationTitle(
    ...rows[0] as [
      number,
      number,
      number,
      string,
      string | null,
      string,
      string | null,
      number | null,
      number,
      number | null,
      boolean,
      boolean | null,
    ],
  );
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<FormationTitle | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_FORMACION,
      FK_NIVEL_FORMACION,
      FK_USUARIO,
      TITULO,
      INSTITUCION,
      TO_CHAR(FECHA_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FECHA_FIN, 'YYYY-MM-DD'),
      FK_CIUDAD,
      FK_ARCHIVO_GENERICO,
      FK_INSTRUCTOR,
      ESTADO,
      BAN_TITULO_CONVALIDADO
     FROM ${TABLE}
     WHERE PK_FORMACION = $1
     AND FK_USUARIO = $2`,
    id,
    user,
  );

  if (!rows.length) return null;

  return new FormationTitle(
    ...rows[0] as [
      number,
      number,
      number,
      string,
      string | null,
      string,
      string | null,
      number | null,
      number,
      number | null,
      boolean,
      boolean | null,
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
    WHERE L.TIPO_FORMACION = '${formation_type}'
    AND T.FK_USUARIO = ${user_id}`
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
