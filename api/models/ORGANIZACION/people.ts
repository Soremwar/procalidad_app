import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
  getTableModels,
  TableResult,
} from "../../common/table.ts";

export const TABLE = "ORGANIZACION.PERSONA";
const ERROR_DEPENDENCY =
  "No se puede eliminar la persona por que hay componentes que dependen de el";

export enum TipoIdentificacion {
  CC = "CC",
  CE = "CE",
  PA = "PA",
  RC = "RC",
  TI = "TI",
}

export enum TipoSangre {
  "A+" = "A+",
  "A-" = "A-",
  "B+" = "B+",
  "B-" = "B-",
  "AB+" = "AB+",
  "AB-" = "AB-",
  "C+" = "C+",
  "C-" = "C-",
  "O+" = "O+",
  "O-" = "O-",
}

class People {
  constructor(
    public readonly pk_persona: number,
    public tipo_identificacion: TipoIdentificacion,
    public identificacion: string,
    public fec_expedicion_identificacion: string | null,
    public fk_ciudad_expedicion_identificacion: number | null,
    public nombre: string,
    public telefono: string,
    public readonly correo: string,
    public fec_nacimiento: string | null,
    public fk_ciudad_nacimiento: number | null,
    public libreta_militar: number | null,
    public fk_genero: number | null,
    public fk_estado_civil: number | null,
    public correo_personal: string | null,
    public telefono_fijo: number | null,
    public tipo_sangre: TipoSangre | null,
    public fk_ciudad_residencia: number | null,
    public direccion_residencia: string | null,
  ) {}

  async update(
    tipo_identificacion: TipoIdentificacion = this.tipo_identificacion,
    identificacion: string = this.identificacion,
    fec_expedicion_identificacion: string | null =
      this.fec_expedicion_identificacion,
    fk_ciudad_expedicion_identificacion: number | null =
      this.fk_ciudad_expedicion_identificacion,
    nombre: string = this.nombre,
    telefono: string = this.telefono,
    fec_nacimiento: string | null = this.fec_nacimiento,
    fk_ciudad_nacimiento: number | null = this.fk_ciudad_nacimiento,
    libreta_militar: number | null = this.libreta_militar,
    fk_genero: number | null = this.fk_genero,
    fk_estado_civil: number | null = this.fk_estado_civil,
    correo_personal: string | null = this.correo_personal,
    telefono_fijo: number | null = this.telefono_fijo,
    tipo_sangre: TipoSangre | null = this.tipo_sangre,
    fk_ciudad_residencia: number | null = this.fk_ciudad_residencia,
    direccion_residencia: string | null = this.direccion_residencia,
  ): Promise<People> {
    Object.assign(this, {
      tipo_identificacion,
      identificacion,
      fec_expedicion_identificacion,
      fk_ciudad_expedicion_identificacion,
      nombre,
      telefono,
      fec_nacimiento,
      fk_ciudad_nacimiento,
      libreta_militar,
      fk_genero,
      fk_estado_civil,
      correo_personal,
      telefono_fijo,
      tipo_sangre,
      fk_ciudad_residencia,
      direccion_residencia,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        TIPO_IDENTIFICACION = $2,
        IDENTIFICACION = $3,
        FEC_EXPEDICION_IDENTIFICACION = $4,
        FK_CIUDAD_EXPEDICION_IDENTIFICACION = $5,
        NOMBRE = $6,
        TELEFONO = $7,
        FEC_NACIMIENTO = $8,
        FK_CIUDAD_NACIMIENTO = $9,
        LIBRETA_MILITAR = $10,
        FK_GENERO = $11,
        FK_ESTADO_CIVIL = $12,
        CORREO_PERSONAL = $13,
        TELEFONO_FIJO = $14,
        TIPO_SANGRE = $15,
        FK_CIUDAD_RESIDENCIA = $16,
        DIRECCION_RESIDENCIA = $17
      WHERE PK_PERSONA = $1`,
      this.pk_persona,
      this.tipo_identificacion,
      this.identificacion,
      this.fec_expedicion_identificacion,
      this.fk_ciudad_expedicion_identificacion,
      this.nombre,
      this.telefono,
      this.fec_nacimiento,
      this.fk_ciudad_nacimiento,
      this.libreta_militar,
      this.fk_genero,
      this.fk_estado_civil,
      this.correo_personal,
      this.telefono_fijo,
      this.tipo_sangre,
      this.fk_ciudad_residencia,
      this.direccion_residencia,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PERSONA = $1`,
      this.pk_persona,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

//TODO
//Replace string call with enum call
export const findAll = async (): Promise<People[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PERSONA,
      TIPO_IDENTIFICACION::VARCHAR,
      IDENTIFICACION,
      TO_CHAR(FEC_EXPEDICION_IDENTIFICACION, 'YYYY-MM-DD'),
      FK_CIUDAD_EXPEDICION_IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO,
      TO_CHAR(FEC_NACIMIENTO, 'YYYY-MM-DD'),
      FK_CIUDAD_NACIMIENTO,
      LIBRETA_MILITAR,
      FK_GENERO,
      FK_ESTADO_CIVIL,
      CORREO_PERSONAL,
      TELEFONO_FIJO,
      TIPO_SANGRE::VARCHAR,
      FK_CIUDAD_RESIDENCIA,
      DIRECCION_RESIDENCIA
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    TipoIdentificacion,
    string,
    string | null,
    number | null,
    string,
    string,
    string,
    string | null,
    number | null,
    number | null,
    number | null,
    number | null,
    string | null,
    number | null,
    TipoSangre | null,
    number | null,
    string | null,
  ]) => new People(...row));
};

//TODO
//Replace string call with enum call
export const findById = async (id: number): Promise<People | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_PERSONA,
      TIPO_IDENTIFICACION::VARCHAR,
      IDENTIFICACION,
      TO_CHAR(FEC_EXPEDICION_IDENTIFICACION, 'YYYY-MM-DD'),
      FK_CIUDAD_EXPEDICION_IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO,
      TO_CHAR(FEC_NACIMIENTO, 'YYYY-MM-DD'),
      FK_CIUDAD_NACIMIENTO,
      LIBRETA_MILITAR,
      FK_GENERO,
      FK_ESTADO_CIVIL,
      CORREO_PERSONAL,
      TELEFONO_FIJO,
      TIPO_SANGRE::VARCHAR,
      FK_CIUDAD_RESIDENCIA,
      DIRECCION_RESIDENCIA
    FROM ${TABLE}
    WHERE PK_PERSONA = $1`,
    id,
  );

  if (!rows.length) return null;

  return new People(
    ...rows[0] as [
      number,
      TipoIdentificacion,
      string,
      string | null,
      number | null,
      string,
      string,
      string,
      string | null,
      number | null,
      number | null,
      number | null,
      number | null,
      string | null,
      number | null,
      TipoSangre | null,
      number | null,
      string | null,
    ],
  );
};

export const createNew = async (
  tipo_identificacion: TipoIdentificacion,
  identificacion: string,
  nombre: string,
  telefono: string,
  correo: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      TIPO_IDENTIFICACION,
      IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    ) RETURNING PK_PERSONA`,
    tipo_identificacion,
    identificacion,
    nombre,
    telefono,
    correo,
  );

  const id: number = rows[0][0];

  return new People(
    id,
    tipo_identificacion,
    identificacion,
    null,
    null,
    nombre,
    telefono,
    correo,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  );
};

class TableData {
  constructor(
    public id: number,
    public identification: string,
    public name: string,
    public phone: string,
    public email: string,
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
      PK_PERSONA AS ID,
      TIPO_IDENTIFICACION||IDENTIFICACION AS IDENTIFICATION,
      NOMBRE AS NAME,
      TELEFONO AS PHONE,
      CORREO AS EMAIL
    FROM ${TABLE}`
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
    string,
    string,
    string,
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
