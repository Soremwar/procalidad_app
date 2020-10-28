import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { DataType, TABLE as REVIEW_TABLE } from "./data_review.ts";

export const TABLE = "USUARIOS.EXPERIENCIA_PROYECTO";

class LaboralExperience {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public client_name: string,
    public client_city: number,
    public project_name: string,
    public project_description: string,
    public tools_used: string[],
    public roles: string[],
    public functions: string,
    public project_start_date: string,
    public project_end_date: string,
    public project_is_internal: boolean,
    public project_contact_name: string,
    public project_contact_phone: number,
    public project_participation: number,
    public approved: boolean | null,
    public observations: string | null,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
    );
  }

  async update(
    client_name: string = this.client_name,
    client_city: number = this.client_city,
    project_name: string = this.project_name,
    project_description: string = this.project_description,
    tools_used: string[] = this.tools_used,
    roles: string[] = this.roles,
    functions: string = this.functions,
    project_start_date: string = this.project_start_date,
    project_end_date: string = this.project_end_date,
    project_is_internal: boolean = this.project_is_internal,
    project_contact_name: string = this.project_contact_name,
    project_contact_phone: number = this.project_contact_phone,
    project_participation: number = this.project_participation,
  ) {
    Object.assign(this, {
      client_name,
      client_city,
      project_name,
      project_description,
      tools_used,
      roles,
      functions,
      project_start_date,
      project_end_date,
      project_is_internal,
      project_contact_name,
      project_contact_phone,
      project_participation,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        CLIENTE = $2,
        FK_CIUDAD = $3,
        PROYECTO = $4,
        DESCRIPCION = $5,
        ENTORNO_TECNOLOGICO = '{${this.tools_used.join(",")}}',
        ROLES = '{${this.roles.join(",")}}',
        FUNCIONES = $6,
        FEC_INICIO = $7,
        FEC_FIN = $8,
        BAN_PROYECTO_INTERNO = $9,
        NOMBRE_CONTACTO = $10,
        TELEFONO_CONTACTO = $11,
        PORCENTAJE_PARTICIPACION = $12
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
      this.client_name,
      this.client_city,
      this.project_name,
      this.project_description,
      this.functions,
      this.project_start_date,
      this.project_end_date,
      this.project_is_internal,
      this.project_contact_name,
      this.project_contact_phone,
      this.project_participation,
    );

    return this;
  }
}

export const create = async (
  user: number,
  client_name: string,
  client_city: number,
  project_name: string,
  project_description: string,
  tools_used: string[],
  roles: string[],
  functions: string,
  project_start_date: string,
  project_end_date: string,
  project_is_internal: boolean,
  project_contact_name: string,
  project_contact_phone: number,
  project_participation: number,
): Promise<LaboralExperience> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      CLIENTE,
      FK_CIUDAD,
      PROYECTO,
      DESCRIPCION,
      ENTORNO_TECNOLOGICO,
      ROLES,
      FUNCIONES,
      FEC_INICIO,
      FEC_FIN,
      BAN_PROYECTO_INTERNO,
      NOMBRE_CONTACTO,
      TELEFONO_CONTACTO,
      PORCENTAJE_PARTICIPACION
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      '{${tools_used.join(",")}}',
      '{${roles.join(",")}}',
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12
    ) RETURNING PK_EXPERIENCIA`,
    user,
    client_name,
    client_city,
    project_name,
    project_description,
    functions,
    project_start_date,
    project_end_date,
    project_is_internal,
    project_contact_name,
    project_contact_phone,
    project_participation,
  );

  const id: number = rows[0][0];

  return new LaboralExperience(
    id,
    user,
    client_name,
    client_city,
    project_name,
    project_description,
    tools_used,
    roles,
    functions,
    project_start_date,
    project_end_date,
    project_is_internal,
    project_contact_name,
    project_contact_phone,
    project_participation,
    null,
    null,
  );
};

export const getAll = async (
  user?: number,
): Promise<LaboralExperience[]> => {
  const { rows } = await postgres.query(
    `SELECT
      E.PK_EXPERIENCIA,
      E.FK_USUARIO,
      E.CLIENTE,
      E.FK_CIUDAD,
      E.PROYECTO,
      E.DESCRIPCION,
      E.ENTORNO_TECNOLOGICO,
      E.ROLES,
      E.FUNCIONES,
      TO_CHAR(E.FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(E.FEC_FIN, 'YYYY-MM-DD'),
      E.BAN_PROYECTO_INTERNO,
      E.NOMBRE_CONTACTO,
      E.TELEFONO_CONTACTO,
      E.PORCENTAJE_PARTICIPACION,
      R.BAN_APROBADO,
      R.OBSERVACION
    FROM ${TABLE} E
    LEFT JOIN ${REVIEW_TABLE} AS R
      ON E.PK_EXPERIENCIA = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_PROYECTO}'
    ${user ? `WHERE E.FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    string,
    string,
    string[],
    string[],
    string,
    string,
    string,
    boolean,
    string,
    number,
    number,
    boolean | null,
    string | null,
  ]) => new LaboralExperience(...row));
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<LaboralExperience | null> => {
  const { rows } = await postgres.query(
    `SELECT
      E.PK_EXPERIENCIA,
      E.FK_USUARIO,
      E.CLIENTE,
      E.FK_CIUDAD,
      E.PROYECTO,
      E.DESCRIPCION,
      E.ENTORNO_TECNOLOGICO,
      E.ROLES,
      E.FUNCIONES,
      TO_CHAR(E.FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(E.FEC_FIN, 'YYYY-MM-DD'),
      E.BAN_PROYECTO_INTERNO,
      E.NOMBRE_CONTACTO,
      E.TELEFONO_CONTACTO,
      E.PORCENTAJE_PARTICIPACION,
      R.BAN_APROBADO,
      R.OBSERVACION
    FROM ${TABLE} E
    LEFT JOIN ${REVIEW_TABLE} AS R
      ON E.PK_EXPERIENCIA = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_PROYECTO}'
    WHERE E.PK_EXPERIENCIA = $1
    AND E.FK_USUARIO = $2`,
    id,
    user,
  );

  return new LaboralExperience(
    ...rows[0] as [
      number,
      number,
      string,
      number,
      string,
      string,
      string[],
      string[],
      string,
      string,
      string,
      boolean,
      string,
      number,
      number,
      boolean | null,
      string | null,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly client: string,
    public readonly project: string,
    public readonly duration: string,
    public readonly participation: number,
    public readonly review_status: number,
  ) {}
}

export const generateTableData = (
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
        E.PK_EXPERIENCIA AS ID,
        E.CLIENTE AS CLIENT,
        E.PROYECTO AS PROJECT,
        ROUND((E.FEC_FIN - E.FEC_INICIO) / 30.0) AS DURATION,
        E.PORCENTAJE_PARTICIPACION AS PARTICIPATION,
        CASE
          WHEN R.BAN_APROBADO = FALSE AND R.OBSERVACION IS NOT NULL THEN 0
          WHEN R.BAN_APROBADO = TRUE THEN 1
          ELSE 2
        END AS REVIEW_STATUS
      FROM ${TABLE} E
      LEFT JOIN ${REVIEW_TABLE} AS R
        ON E.PK_EXPERIENCIA = R.FK_DATOS
        AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_LABORAL}'
      WHERE E.FK_USUARIO = ${user_id}`
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
      number,
    ]) => new TableData(...x));

    return new TableResult(
      count,
      models,
    );
  };
};
