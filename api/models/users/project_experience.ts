import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";

export const TABLE = "USUARIOS.EXPERIENCIA_PROYECTO";

class LaboralExperience {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public client_name: string,
    public client_city: number,
    public project_name: string,
    public project_description: string,
    public tools_used: string,
    public roles: string[],
    public functions: string,
    public project_start_date: string,
    public project_end_date: string,
    public project_is_internal: boolean,
    public project_contact_name: string,
    public project_contact_phone: number,
    public project_participation: number,
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
    tools_used: string = this.tools_used,
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
        ENTORNO_TECNOLOGICO = $6,
        ROLES = '{${this.roles.join(",")}}',
        FUNCIONES = $7,
        FEC_INICIO = $8,
        FEC_FIN = $9,
        BAN_PROYECTO_INTERNO = $10,
        NOMBRE_CONTACTO = $11,
        TELEFONO_CONTACTO = $12,
        PORCENTAJE_PARTICIPACION = $13
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
      this.client_name,
      this.client_city,
      this.project_name,
      this.project_description,
      this.tools_used,
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
  tools_used: string,
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
      $6,
      '{${roles.join(",")}}',
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13
    ) RETURNING PK_EXPERIENCIA`,
    user,
    client_name,
    client_city,
    project_name,
    project_description,
    tools_used,
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
  );
};

export const getAll = async (
  user?: number,
): Promise<LaboralExperience[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_EXPERIENCIA,
      FK_USUARIO,
      CLIENTE,
      FK_CIUDAD,
      PROYECTO,
      DESCRIPCION,
      ENTORNO_TECNOLOGICO,
      ROLES,
      FUNCIONES,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
      BAN_PROYECTO_INTERNO,
      NOMBRE_CONTACTO,
      TELEFONO_CONTACTO,
      PORCENTAJE_PARTICIPACION
    FROM ${TABLE}
    ${user ? `WHERE FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    string,
    string,
    string,
    string[],
    string,
    string,
    string,
    boolean,
    string,
    number,
    number,
  ]) => new LaboralExperience(...row));
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<LaboralExperience | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_EXPERIENCIA,
      FK_USUARIO,
      CLIENTE,
      FK_CIUDAD,
      PROYECTO,
      DESCRIPCION,
      ENTORNO_TECNOLOGICO,
      ROLES,
      FUNCIONES,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_FIN, 'YYYY-MM-DD'),
      BAN_PROYECTO_INTERNO,
      NOMBRE_CONTACTO,
      TELEFONO_CONTACTO,
      PORCENTAJE_PARTICIPACION
    FROM ${TABLE}
    WHERE PK_EXPERIENCIA = $1
    AND FK_USUARIO = $2`,
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
      string,
      string[],
      string,
      string,
      string,
      boolean,
      string,
      number,
      number,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly client: string,
    public readonly project: string,
    public readonly duration: string,
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
        PK_EXPERIENCIA AS ID,
        CLIENTE AS CLIENT,
        PROYECTO AS PROJECT,
        ROUND((FEC_FIN - FEC_INICIO) / 30.0) AS DURATION
      FROM ${TABLE}
      WHERE FK_USUARIO = ${user_id}`
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
    ]) => new TableData(...x));

    return new TableResult(
      count,
      models,
    );
  };
};
