import postgres from "../../services/postgres.js";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { TABLE as GENERIC_FILE_TABLE } from "../files/generic_file.ts";
import { TABLE as SECTOR_TABLE } from "../CLIENTES/SECTOR.ts";
import { DataType, TABLE as REVIEW_TABLE } from "./data_review.ts";

export const TABLE = "USUARIOS.EXPERIENCIA_LABORAL";

class LaboralExperience {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public readonly company_name: string,
    public company_nit: number,
    public company_verification_digit: number,
    public company_sector: number,
    public company_city: number,
    public company_address: string,
    public company_phone: number,
    public contact: string,
    public start_date: string,
    public end_date: string,
    public position: string,
    public function_description: string,
    public achievement_description: string,
    public generic_file: number | null,
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
    company_nit: number = this.company_nit,
    company_verification_digit: number = this.company_verification_digit,
    company_sector: number = this.company_sector,
    company_city: number = this.company_city,
    company_address: string = this.company_address,
    company_phone: number = this.company_phone,
    contact: string = this.contact,
    start_date: string = this.start_date,
    end_date: string = this.end_date,
    position: string = this.position,
    function_description: string = this.function_description,
    achievement_description: string = this.achievement_description,
    generic_file: number | null = this.generic_file,
  ) {
    Object.assign(this, {
      company_nit,
      company_verification_digit,
      company_sector,
      company_city,
      company_address,
      company_phone,
      contact,
      start_date,
      end_date,
      position,
      function_description,
      achievement_description,
      generic_file,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NIT = $2,
        D_VERIFICACION = $3,
        FK_SECTOR = $4,
        FK_CIUDAD = $5,
        DIRECCION = $6,
        TELEFONO = $7,
        CONTACTO = $8,
        FEC_INICIO = $9,
        FEC_FIN = $10,
        CARGO = $11,
        DES_FUNCIONES = $12,
        DES_LOGROS = $13,
        FK_ARCHIVO_GENERICO = $14
      WHERE PK_EXPERIENCIA = $1`,
      this.id,
      this.company_nit,
      this.company_verification_digit,
      this.company_sector,
      this.company_city,
      this.company_address,
      this.company_phone,
      this.contact,
      this.start_date,
      this.end_date,
      this.position,
      this.function_description,
      this.achievement_description,
      this.generic_file,
    );

    return this;
  }
}

export const create = async (
  user: number,
  company_name: string,
  company_nit: number,
  company_verification_digit: number,
  company_sector: number,
  company_city: number,
  company_address: string,
  company_phone: number,
  contact: string,
  start_date: string,
  end_date: string,
  position: string,
  function_description: string,
  achievement_description: string,
): Promise<LaboralExperience> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      EMPRESA,
      NIT,
      D_VERIFICACION,
      FK_SECTOR,
      FK_CIUDAD,
      DIRECCION,
      TELEFONO,
      CONTACTO,
      FEC_INICIO,
      FEC_FIN,
      CARGO,
      DES_FUNCIONES,
      DES_LOGROS
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
      $10,
      $11,
      $12,
      $13,
      $14
    ) RETURNING PK_EXPERIENCIA`,
    user,
    company_name,
    company_nit,
    company_verification_digit,
    company_sector,
    company_city,
    company_address,
    company_phone,
    contact,
    start_date,
    end_date,
    position,
    function_description,
    achievement_description,
  );

  const id: number = rows[0][0];

  return new LaboralExperience(
    id,
    user,
    company_name,
    company_nit,
    company_verification_digit,
    company_sector,
    company_city,
    company_address,
    company_phone,
    contact,
    start_date,
    end_date,
    position,
    function_description,
    achievement_description,
    null,
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
      E.EMPRESA,
      E.NIT,
      E.D_VERIFICACION,
      E.FK_SECTOR,
      E.FK_CIUDAD,
      E.DIRECCION,
      E.TELEFONO,
      E.CONTACTO,
      TO_CHAR(E.FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(E.FEC_FIN, 'YYYY-MM-DD'),
      E.CARGO,
      E.DES_FUNCIONES,
      E.DES_LOGROS,
      E.FK_ARCHIVO_GENERICO,
      R.BAN_APROBADO,
      R.OBSERVACION
    FROM ${TABLE} E
    LEFT JOIN ${REVIEW_TABLE} AS R
      ON E.PK_EXPERIENCIA = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_LABORAL}'
    ${user ? `WHERE E.FK_USUARIO = ${user}` : ""}`,
  );

  return rows.map((row: [
    number,
    number,
    string,
    number,
    number,
    number,
    number,
    string,
    number,
    string,
    string,
    string,
    string,
    string,
    string,
    number | null,
    boolean | null,
    string | null,
  ]) => new LaboralExperience(...row));
};

export const findById = async (
  id: number,
): Promise<LaboralExperience | null> => {
  const { rows } = await postgres.query(
    `SELECT
      E.PK_EXPERIENCIA,
      E.FK_USUARIO,
      E.EMPRESA,
      E.NIT,
      E.D_VERIFICACION,
      E.FK_SECTOR,
      E.FK_CIUDAD,
      E.DIRECCION,
      E.TELEFONO,
      E.CONTACTO,
      TO_CHAR(E.FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(E.FEC_FIN, 'YYYY-MM-DD'),
      E.CARGO,
      E.DES_FUNCIONES,
      E.DES_LOGROS,
      E.FK_ARCHIVO_GENERICO,
      R.BAN_APROBADO,
      R.OBSERVACION
    FROM ${TABLE} E
    LEFT JOIN ${REVIEW_TABLE} AS R
      ON E.PK_EXPERIENCIA = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_LABORAL}'
    WHERE E.PK_EXPERIENCIA = $1`,
    id,
  );

  return new LaboralExperience(
    ...rows[0] as [
      number,
      number,
      string,
      number,
      number,
      number,
      number,
      string,
      number,
      string,
      string,
      string,
      string,
      string,
      string,
      number | null,
      boolean | null,
      string | null,
    ],
  );
};

export const findByIdAndUser = async (
  id: number,
  user: number,
): Promise<LaboralExperience | null> => {
  const { rows } = await postgres.query(
    `SELECT
      E.PK_EXPERIENCIA,
      E.FK_USUARIO,
      E.EMPRESA,
      E.NIT,
      E.D_VERIFICACION,
      E.FK_SECTOR,
      E.FK_CIUDAD,
      E.DIRECCION,
      E.TELEFONO,
      E.CONTACTO,
      TO_CHAR(E.FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(E.FEC_FIN, 'YYYY-MM-DD'),
      E.CARGO,
      E.DES_FUNCIONES,
      E.DES_LOGROS,
      E.FK_ARCHIVO_GENERICO,
      R.BAN_APROBADO,
      R.OBSERVACION
    FROM ${TABLE} E
    LEFT JOIN ${REVIEW_TABLE} AS R
      ON E.PK_EXPERIENCIA = R.FK_DATOS
      AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_LABORAL}'
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
      number,
      number,
      number,
      string,
      number,
      string,
      string,
      string,
      string,
      string,
      string,
      number | null,
      boolean | null,
      string | null,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly person: number,
    public readonly sector: string,
    public readonly company: string,
    public readonly duration: number,
    public readonly file: {
      id: number;
      extensions: string[];
    },
    public readonly upload_date: string,
    public readonly review_status: number,
  ) {}
}

export const generateTableData = (
  user_id?: number,
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
        E.FK_USUARIO AS PERSON,
        (SELECT NOMBRE FROM ${SECTOR_TABLE} WHERE PK_SECTOR = E.FK_SECTOR) AS SECTOR,
        E.EMPRESA AS COMPANY,
        DATE_PART('YEAR', FEC_FIN) - DATE_PART('YEAR', FEC_INICIO) AS DURATION,
        E.FK_ARCHIVO_GENERICO,
        F.EXTENSIONES,
        F.FEC_CARGA AS UPLOAD_DATE,
        CASE
          WHEN R.BAN_APROBADO = FALSE AND R.OBSERVACION IS NOT NULL THEN 0
          WHEN R.BAN_APROBADO = TRUE THEN 1
          WHEN E.FK_ARCHIVO_GENERICO IS NULL THEN 3
          ELSE 2
        END AS REVIEW_STATUS
      FROM ${TABLE} AS E
      LEFT JOIN ${GENERIC_FILE_TABLE} AS F
        ON F.PK_ARCHIVO = E.FK_ARCHIVO_GENERICO
      LEFT JOIN ${REVIEW_TABLE} AS R
        ON E.PK_EXPERIENCIA = R.FK_DATOS
        AND R.TIPO_FORMULARIO = '${DataType.EXPERIENCIA_LABORAL}'
      ${user_id ? `WHERE E.FK_USUARIO = ${user_id}` : ""}`
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
      string,
      string,
      number,
      number,
      string[],
      string,
      number,
    ]) =>
      new TableData(
        x[0],
        x[1],
        x[2],
        x[3],
        x[4],
        {
          id: x[5],
          extensions: x[6],
        },
        x[7],
        x[8],
      )
    );

    return new TableResult(
      count,
      models,
    );
  };
};
