import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

const TABLE = "ORGANIZACION.SALARIO";
const ERROR_DEPENDENCY =
  "No se puede eliminar el area por que hay componentes que dependen de el";

export enum TipoSalario {
  //integral
  I = "I",
  //ordinario
  O = "O",
}

class Salario {
  constructor(
    public readonly pk_salario: number,
    public fk_persona: number,
    public fk_computador: number,
    public valor_prestacional: number,
    public valor_bonos: number,
    public licencias: number,
    public otros: number,
    public salario: number | undefined,
    public tipo_salario: TipoSalario,
  ) {}

  async update(
    fk_persona: number = this.fk_persona,
    fk_computador: number = this.fk_computador,
    valor_prestacional: number = this.valor_prestacional,
    valor_bonos: number = this.valor_bonos,
    licencias: number = this.licencias,
    otros: number = this.otros,
    tipo_salario: TipoSalario = this.tipo_salario,
  ): Promise<
    Salario
  > {
    Object.assign(this, {
      fk_persona,
      fk_computador,
      valor_prestacional,
      valor_bonos,
      licencias,
      otros,
      tipo_salario,
    });
    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        FK_PERSONA = $2,
        FK_COMPUTADOR = $3,
        VALOR_PRESTACIONAL = $4,
        VALOR_BONOS = $5,
        LICENCIAS = $6,
        OTROS = $7,
        TIPO_SALARIO = $8
      WHERE PK_SALARIO = $1
      RETURNING SALARIO`,
      this.pk_salario,
      this.fk_persona,
      this.fk_computador,
      this.valor_prestacional,
      this.valor_bonos,
      this.licencias,
      this.otros,
      this.tipo_salario,
    );

    const salario = rows[0][0];
    this.salario = salario;

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_SALARIO = $1`,
      this.pk_salario,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const getCalculatedResult = async (id: number) => {
  const { rows } = await postgres.query(
    `WITH PARAMETROS AS (
      SELECT
        SUM(CASE WHEN PAR.nombre = 'V_SMMLV' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_SMMLV,
        SUM(CASE WHEN PAR.nombre = 'V_Porc_Parafiscales' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_Porc_Parafiscales,
        SUM(CASE WHEN PAR.nombre = 'V_Factor_Integral' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_Factor_Integral,
        SUM(CASE WHEN PAR.nombre = 'V_Aux_Transporte' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_Aux_Transporte,
        SUM(CASE WHEN PAR.nombre = 'V_Bono_Dotacion_Cuatrimestral' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_Bono_Dotacion_Cuatrimestral
      FROM maestro.parametro AS PAR
      JOIN maestro.parametro_definicion AS DEF
      ON PAR.pk_parametro = DEF.fk_parametro
      WHERE NOW() BETWEEN DEF.fec_inicio AND DEF.fec_fin
    )
    SELECT
      CASE
        WHEN PAR.V_SMMLV * 2 > SAL.VALOR_PRESTACIONAL THEN (SAL.valor_prestacional * (100/(1 + PAR.V_Porc_Parafiscales))) + PAR.V_Aux_Transporte + (PAR.V_Bono_Dotacion_Cuatrimestral / 4) + SAL.valor_bonos + SAL.OTROS
        WHEN SAL.tipo_salario = 'O' THEN (SAL.valor_prestacional * (100 / (1 + PAR.V_Porc_Parafiscales))) + SAL.valor_bonos + SAL.OTROS
        ELSE ((SAL.valor_prestacional * (100 / PAR.V_Factor_Integral))) + (100 / (1 + PAR.V_Porc_Parafiscales)) + SAL.valor_bonos + SAL.OTROS + (SAL.valor_prestacional * (100 / (1 - PAR.V_Factor_Integral)))
      END AS SALARIO
    FROM organizacion.salario SAL
    JOIN PARAMETROS AS PAR ON 1 = 1
    WHERE SAL.PK_SALARIO = $1`,
    id,
  );

  if (!rows[0]) return null;

  return rows[0][0];
};

export const findAll = async (): Promise<Salario[]> => {
  const { rows } = await postgres.query(
    `SELECT
      FK_PERSONA,
      FK_COMPUTADOR,
      VALOR_PRESTACIONAL,
      VALOR_BONOS,
      LICENCIAS,
      OTROS,
      SALARIO,
      TIPO_SALARIO
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
    TipoSalario,
  ]) => new Salario(...row));

  return models;
};

export const findById = async (id: number): Promise<Salario | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SALARIO,
      FK_PERSONA,
      FK_COMPUTADOR,
      VALOR_PRESTACIONAL,
      VALOR_BONOS,
      LICENCIAS,
      OTROS,
      SALARIO,
      TIPO_SALARIO
    FROM ${TABLE}
    WHERE PK_SALARIO = $1`,
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
    TipoSalario,
  ] = rows[0];
  return new Salario(...result);
};

export const createNew = async (
  fk_persona: number,
  fk_computador: number,
  valor_prestacional: number,
  valor_bonos: number,
  licencias: number,
  otros: number,
  tipo_salario: TipoSalario,
): Promise<Salario> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_COMPUTADOR,
      VALOR_PRESTACIONAL,
      VALOR_BONOS,
      LICENCIAS,
      OTROS,
      TIPO_SALARIO
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING PK_SALARIO`,
    fk_persona,
    fk_computador,
    valor_prestacional,
    valor_bonos,
    licencias,
    otros,
    tipo_salario,
  );

  const id: number = rows[0][0];

  return new Salario(
    id,
    fk_persona,
    fk_computador,
    valor_prestacional,
    valor_bonos,
    licencias,
    otros,
    undefined,
    tipo_salario,
  );
};

class TableData {
  constructor(
    public id: number,
    public person: string,
    public salary_type: string,
    public computer: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: string,
): Promise<TableData[]> => {
  //TODO
  //Replace search string with search object passed from the frontend table definition

  //TODO
  //Normalize query generator

  const query = `SELECT * FROM (SELECT
      PK_SALARIO AS ID,
      (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA  = FK_PERSONA) AS PERSON,
      CASE WHEN TIPO_SALARIO = 'I' THEN 'Integral' ELSE 'Ordinario' END AS SALARY_TYPE,
      (SELECT NOMBRE FROM ORGANIZACION.COMPUTADOR WHERE PK_COMPUTADOR = FK_COMPUTADOR) AS COMPUTER
    FROM ${TABLE}) AS TOTAL
    WHERE
      UNACCENT(PERSON) ILIKE '%${search}%' OR
      UNACCENT(COMPUTER) ILIKE '%${search}%'` +
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
  ]) => new TableData(...x));

  return models;
};
