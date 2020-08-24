import postgres from "../../services/postgres.js";

//TODO
//Change queries so value is parsed to default value
//Take into account no definitions might exist but a value must exist still
//Move getParameterValue to model Parametro for such defaults to take place

export const TABLE = "MAESTRO.PARAMETRO_DEFINICION";

export type ValorParametro = string | number;

class ParametroDefinicion {
  constructor(
    public readonly pk_definicion: number,
    public readonly fk_parametro: number,
    public fec_inicio: Date,
    public fec_fin: Date,
    public valor: ValorParametro,
  ) {}

  async update(
    fec_inicio: Date = this.fec_inicio,
    fec_fin: Date = this.fec_fin,
    valor: ValorParametro = this.valor,
  ): Promise<ParametroDefinicion> {
    Object.assign(this, {
      fec_inicio,
      fec_fin,
      valor,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        FEC_INICIO = $2,
        FEC_FIN = $3,
        VALOR = $4
      WHERE FK_PARAMETRO = $1`,
      this.pk_definicion,
      this.fec_inicio,
      this.fec_fin,
      this.valor,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_DEFINICION = $1`,
      this.pk_definicion,
    );
  }
}

export const findAll = async (): Promise<ParametroDefinicion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_DEFINICION,
      FK_PARAMETRO,
      FEC_INICIO,
      FEC_FIN,
      VALOR
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    number,
    Date,
    Date,
    ValorParametro,
  ]) => new ParametroDefinicion(...row));

  return models;
};

export const getActiveDefinition = async (
  parameter: number,
): Promise<ParametroDefinicion | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_DEFINICION,
      FK_PARAMETRO,
      FEC_INICIO,
      FEC_FIN,
      VALOR
    FROM ${TABLE}
    WHERE FK_PARAMETRO = $1
    AND NOW() BETWEEN FEC_INICIO AND FEC_FIN`,
    parameter,
  );

  if (!rows.length) return null;

  return new ParametroDefinicion(
    ...rows[0] as [
      number,
      number,
      Date,
      Date,
      ValorParametro,
    ],
  );
};

export const findById = async (
  id: number,
): Promise<ParametroDefinicion | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_DEFINICION,
      FK_PARAMETRO,
      FEC_INICIO,
      FEC_FIN,
      VALOR
    FROM ${TABLE}
    WHERE PK_DEFINICION = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    Date,
    Date,
    ValorParametro,
  ] = rows[0];

  return new ParametroDefinicion(...result);
};

export const searchByParameter = async (
  parameter: number,
  limit: number,
): Promise<ParametroDefinicion[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_DEFINICION,
      FK_PARAMETRO,
      FEC_INICIO,
      FEC_FIN,
      VALOR
    FROM ${TABLE}
    WHERE FK_PARAMETRO = $1
    ${limit ? `LIMIT ${limit}` : ""}`,
    parameter,
  );

  const models = rows.map((row: [
    number,
    number,
    Date,
    Date,
    ValorParametro,
  ]) => new ParametroDefinicion(...row));

  return models;
};

export const createNew = async (
  fk_parametro: number,
  fec_inicio: Date,
  fec_fin: Date,
  valor: ValorParametro,
): Promise<ParametroDefinicion> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PARAMETRO,
      FEC_INICIO,
      FEC_FIN,
      VALOR
    ) VALUES ($1, $2, $3, $4)
    RETURNING PK_DEFINICION`,
    fk_parametro,
    fec_inicio,
    fec_fin,
    valor,
  );

  const id: number = rows[0][0];

  return new ParametroDefinicion(
    id,
    fk_parametro,
    fec_inicio,
    fec_fin,
    valor,
  );
};
