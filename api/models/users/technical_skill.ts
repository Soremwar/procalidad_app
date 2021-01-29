import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as TOOL_TABLE } from "../MAESTRO/tool.ts";

export const TABLE = "USUARIOS.HABILIDAD_TECNICA";

export enum DevelopmentSkill {
  "No" = "No",
  "Basico" = "Basico",
  "Intermedio" = "Intermedio",
  "Avanzado" = "Avanzado",
}

class TechnicalSkill {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public readonly skill: number,
    public installation: boolean,
    public administration: boolean,
    public development: DevelopmentSkill,
  ) {}

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_HABILIDAD = $1`,
      this.id,
    );
  }

  async update(
    installation: boolean = this.installation,
    administration: boolean = this.administration,
    development: DevelopmentSkill = this.development,
  ): Promise<TechnicalSkill> {
    Object.assign(this, {
      installation,
      administration,
      development,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        INSTALACION = $2,
        ADMINISTRACION = $3,
        DESARROLLO = $4
      WHERE PK_HABILIDAD = $1`,
      this.id,
      this.installation,
      this.administration,
      this.development,
    );

    return this;
  }
}

export const create = async (
  user: number,
  skill: number,
  installation: boolean,
  administration: boolean,
  development: DevelopmentSkill,
): Promise<TechnicalSkill> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      FK_HERRAMIENTA,
      INSTALACION,
      ADMINISTRACION,
      DESARROLLO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    ) RETURNING PK_HABILIDAD`,
    user,
    skill,
    installation,
    administration,
    development,
  );

  const id: number = rows[0][0];

  return new TechnicalSkill(
    id,
    user,
    skill,
    installation,
    administration,
    development,
  );
};

export const getAll = async (
  user?: number,
): Promise<TechnicalSkill[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_HABILIDAD,
      FK_USUARIO,
      FK_HERRAMIENTA,
      INSTALACION,
      ADMINISTRACION,
      DESARROLLO::VARCHAR
    FROM ${TABLE}
    ${user ? `WHERE FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    boolean,
    boolean,
    DevelopmentSkill,
  ]) => new TechnicalSkill(...row));
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<TechnicalSkill | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_HABILIDAD,
      FK_USUARIO,
      FK_HERRAMIENTA,
      INSTALACION,
      ADMINISTRACION,
      DESARROLLO::VARCHAR
    FROM ${TABLE}
    WHERE PK_HABILIDAD = $1
    AND FK_USUARIO = $2`,
    id,
    user,
  );

  return new TechnicalSkill(
    ...rows[0] as [
      number,
      number,
      number,
      boolean,
      boolean,
      DevelopmentSkill,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly skill: number,
    public readonly installation: boolean,
    public readonly administration: boolean,
    public readonly development: DevelopmentSkill,
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
        PK_HABILIDAD AS ID,
        (SELECT NOMBRE FROM ${TOOL_TABLE} WHERE PK_HERRAMIENTA = FK_HERRAMIENTA) AS SKILL,
        INSTALACION AS INSTALLATION,
        ADMINISTRACION AS ADMINISTRATION,
        DESARROLLO::VARCHAR AS DEVELOPMENT
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
      number,
      boolean,
      boolean,
      DevelopmentSkill,
    ]) => new TableData(...x));

    return new TableResult(
      count,
      models,
    );
  };
};
