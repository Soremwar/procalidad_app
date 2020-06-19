import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";
import {
  TABLE as LICENSE_TABLE,
} from "./licencia.ts";

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
    public readonly fk_persona: number,
    public fk_computador: number,
    public valor_prestacional: number,
    public valor_bonos: number,
    public licencias: number[],
    public otros: number,
    public salario: number | undefined,
    public tipo_salario: TipoSalario,
  ) { }

  async update(
    fk_computador: number = this.fk_computador,
    valor_prestacional: number = this.valor_prestacional,
    valor_bonos: number = this.valor_bonos,
    licencias: number[] = this.licencias,
    otros: number = this.otros,
    tipo_salario: TipoSalario = this.tipo_salario,
  ): Promise<
    Salario
  > {
    Object.assign(this, {
      fk_computador,
      valor_prestacional,
      valor_bonos,
      licencias,
      otros,
      tipo_salario,
    });

    const person_has_cost: boolean = await personHasCost(this.fk_persona, this.pk_salario);

    if(person_has_cost) throw new Error("El coste para la persona ya ha sido calculado");

    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        FK_COMPUTADOR = $2,
        VALOR_PRESTACIONAL = $3,
        VALOR_BONOS = $4,
        LICENCIAS = '{${licencias.join(',')}}',
        OTROS = $5,
        TIPO_SALARIO = $6
      WHERE PK_SALARIO = $1
      RETURNING SALARIO`,
      this.pk_salario,
      this.fk_computador,
      this.valor_prestacional,
      this.valor_bonos,
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

class CalculoCostoEmpleado {
  constructor(
    public readonly costo: number,
    public readonly costo_total: number,
  ){}
}

export const getCalculatedResult = async (
  valor_prestacional: number,
  valor_bonos: number,
  licencias: number[],
  otros: number,
  tipo_salario: TipoSalario,
  computador: number,
) => {
  const { rows } = await postgres.query(
    `WITH
    PARAMETROS AS (
      SELECT
        SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_SMMLV' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_SMMLV,
        SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Porc_Parafiscales' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_PORC_PARAFISCALES,
        SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Factor_Integral' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_FACTOR_INTEGRAL,
        SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Aux_Transporte' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_AUX_TRANSPORTE,
        SUM(CASE WHEN PAR.NOMBRE ILIKE 'V_Bono_Dotacion_Cuatrimestral' THEN DEF.VALOR::NUMERIC ELSE 0 END )AS V_BONO_DOTACION_CUATRIMESTRAL
      FROM MAESTRO.PARAMETRO AS PAR
      JOIN MAESTRO.PARAMETRO_DEFINICION AS DEF
      ON PAR.PK_PARAMETRO = DEF.FK_PARAMETRO
      WHERE NOW() BETWEEN DEF.FEC_INICIO AND DEF.FEC_FIN
    ),
    COSTOS AS (
      SELECT
        CAST($1 AS NUMERIC) AS VALOR_PRESTACIONAL,
        CAST($2 AS NUMERIC) AS VALOR_BONOS,
        ${licencias.length
          ? `(SELECT
              COALESCE(SUM(COSTO), 0)
            FROM ${LICENSE_TABLE}
            WHERE PK_LICENCIA IN (${licencias.join(',')}))`
          : `0`
        } AS LICENCIAS,
        CAST($3 AS NUMERIC) AS OTROS,
        $4 AS TIPO_SALARIO
    ),
    COSTO_EMPLEADO AS (
      SELECT
        CASE
          WHEN PAR.V_SMMLV * 2 > COSTOS.VALOR_PRESTACIONAL
            THEN (COSTOS.VALOR_PRESTACIONAL * (1 + (PAR.V_PORC_PARAFISCALES / 100))) + PAR.V_AUX_TRANSPORTE + (PAR.V_BONO_DOTACION_CUATRIMESTRAL / 4) + COSTOS.VALOR_BONOS + COSTOS.OTROS
          WHEN COSTOS.TIPO_SALARIO = 'O'
            THEN (COSTOS.VALOR_PRESTACIONAL * (1 + (PAR.V_PORC_PARAFISCALES / 100))) + COSTOS.VALOR_BONOS + COSTOS.OTROS
          ELSE
            (((COSTOS.VALOR_PRESTACIONAL * (PAR.V_FACTOR_INTEGRAL / 100))) * (1 + (PAR.V_PORC_PARAFISCALES / 100))) + COSTOS.VALOR_BONOS + COSTOS.OTROS + (COSTOS.VALOR_PRESTACIONAL * (1 - (PAR.V_FACTOR_INTEGRAL / 100)))
        END AS COSTO
      FROM COSTOS
      JOIN PARAMETROS AS PAR ON 1 = 1
    )
    SELECT
      CAST(COSTO AS INTEGER) AS COSTO,
      CAST(COSTO + COSTOS.LICENCIAS + (SELECT COSTO FROM ORGANIZACION.COMPUTADOR WHERE PK_COMPUTADOR = $5) AS INTEGER) AS COSTO_TOTAL
    FROM COSTO_EMPLEADO
    JOIN COSTOS ON 1 = 1`,
    valor_prestacional,
    valor_bonos,
    otros,
    tipo_salario,
    computador,
  );

  const calculated_result: [
    number,
    number,
  ] = rows[0];

  return new CalculoCostoEmpleado(...calculated_result);
};

//TODO
//Remove array_to_string and array parse of the values
//(Waiting on Deno update)
export const findAll = async (): Promise<Salario[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SALARIO,
      FK_PERSONA,
      FK_COMPUTADOR,
      VALOR_PRESTACIONAL,
      VALOR_BONOS,
      ARRAY_TO_STRING(LICENCIAS, ','),
      OTROS,
      SALARIO,
      TIPO_SALARIO
    FROM ${TABLE}`,
  );

  const models = rows.map(([
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    i,
  ]: [
    number,
    number,
    number,
    number,
    number,
    string,
    number,
    number,
    TipoSalario,
  ]) => new Salario(
    a,
    b,
    c,
    d,
    e,
    f.split(',').map(Number).filter(Boolean),
    g,
    h,
    i,
  ));

  return models;
};

//TODO
//Remove array_to_string and array parse of the values
//(Waiting on Deno update)
export const findById = async (id: number): Promise<Salario | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SALARIO,
      FK_PERSONA,
      FK_COMPUTADOR,
      VALOR_PRESTACIONAL,
      VALOR_BONOS,
      ARRAY_TO_STRING(LICENCIAS, ','),
      OTROS,
      SALARIO,
      TIPO_SALARIO
    FROM ${TABLE}
    WHERE PK_SALARIO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const [
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    i,
  ]: [
    number,
    number,
    number,
    number,
    number,
    string,
    number,
    number,
    TipoSalario,
  ] = rows[0];
  return new Salario(
    a,
    b,
    c,
    d,
    e,
    f.split(',').map(Number).filter(Boolean),
    g,
    h,
    i,
  );
};

export const personHasCost = async (
  person: number,
  salary: number = 0,
): Promise<boolean> => {
  const { rows } = await postgres.query(
    `SELECT 1
    FROM ${TABLE}
    WHERE FK_PERSONA = $1
    AND PK_SALARIO <> $2`,
    person,
    salary,
  );

  return Boolean(rows.length);
};

export const createNew = async (
  fk_persona: number,
  fk_computador: number,
  valor_prestacional: number,
  valor_bonos: number,
  licencias: number[],
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
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      '{${licencias.join(',')}}',
      $5,
      $6
    ) RETURNING PK_SALARIO`,
    fk_persona,
    fk_computador,
    valor_prestacional,
    valor_bonos,
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
  ) { }
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
