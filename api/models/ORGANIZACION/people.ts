import postgres from "../../services/postgres.js";
import type { PostgresError } from "deno_postgres";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { DataType, TABLE as REVIEW_TABLE } from "../users/data_review.ts";
import { TABLE as POSITION_ASSIGNATION_TABLE } from "./asignacion_cargo.ts";
import { TABLE as POSITION_TABLE } from "./cargo.ts";
import {
  SkillLevel as LanguageSkill,
  TABLE as LANGUAGE_SKILL_TABLE,
} from "../users/language_experience.ts";
import { TABLE as LANGUAGE_TABLE } from "../MAESTRO/language.ts";
import { TABLE as FORMATION_TABLE } from "../users/formation_title.ts";
import {
  FormationType,
  TABLE as FORMATION_LEVEL_TABLE,
} from "../users/formation_level.ts";
import { TABLE as LABORAL_EXPERIENCE_TABLE } from "../users/laboral_experience.ts";
import { TABLE as PROJECT_EXPERIENCE_TABLE } from "../users/project_experience.ts";
import { TABLE as CERTIFICATION_TABLE } from "../users/certification.ts";
import { TABLE as CERTIFICATION_TEMPLATE_TABLE } from "../users/certification_template.ts";
import { TABLE as CERTIFICATION_PROVIDER_TABLE } from "../users/certification_provider.ts";
import {
  DevelopmentSkill as ToolSkill,
  TABLE as TOOL_SKILL_TABLE,
} from "../users/technical_skill.ts";
import { TABLE as TOOL_TABLE } from "../MAESTRO/tool.ts";

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

export class People {
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
    public fecha_inicio: string | null,
    public fecha_retiro: string | null,
    public expedicion_tarjeta_profesional: string | null,
  ) {}

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
    fecha_inicio: string | null = this.fecha_inicio,
    fecha_retiro: string | null = this.fecha_retiro,
    expedicion_tarjeta_profesional: string | null =
      this.expedicion_tarjeta_profesional,
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
      fecha_inicio,
      fecha_retiro,
      expedicion_tarjeta_profesional,
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
        DIRECCION_RESIDENCIA = $17,
        FEC_INICIO = $18,
        FEC_RETIRO = $19,
        EXPEDICION_TARJETA_PROFESIONAL = $20
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
      this.fecha_inicio,
      this.fecha_retiro,
      this.expedicion_tarjeta_profesional,
    );

    return this;
  }
}

class PeopleReview extends People {
  constructor(
    pk_persona: number,
    tipo_identificacion: TipoIdentificacion,
    identificacion: string,
    fec_expedicion_identificacion: string | null,
    fk_ciudad_expedicion_identificacion: number | null,
    nombre: string,
    telefono: string,
    correo: string,
    fec_nacimiento: string | null,
    fk_ciudad_nacimiento: number | null,
    libreta_militar: number | null,
    fk_genero: number | null,
    fk_estado_civil: number | null,
    correo_personal: string | null,
    telefono_fijo: number | null,
    tipo_sangre: TipoSangre | null,
    fk_ciudad_residencia: number | null,
    direccion_residencia: string | null,
    fecha_inicio: string | null,
    fecha_retiro: string | null,
    expedicion_tarjeta_profesional: string | null,
    public informacion_principal_aprobada: boolean | null,
    public informacion_principal_observaciones: string | null,
    public identificacion_aprobada: boolean | null,
    public identificacion_observaciones: string | null,
    public residencia_aprobada: boolean | null,
    public residencia_observaciones: string | null,
  ) {
    super(
      pk_persona,
      tipo_identificacion,
      identificacion,
      fec_expedicion_identificacion,
      fk_ciudad_expedicion_identificacion,
      nombre,
      telefono,
      correo,
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
      fecha_inicio,
      fecha_retiro,
      expedicion_tarjeta_profesional,
    );
  }
}

export const create = async (
  tipo_identificacion: TipoIdentificacion,
  identificacion: string,
  nombre: string,
  telefono: string,
  correo: string,
  fecha_inicio: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      TIPO_IDENTIFICACION,
      IDENTIFICACION,
      NOMBRE,
      TELEFONO,
      CORREO,
      FEC_INICIO
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    ) RETURNING PK_PERSONA`,
    tipo_identificacion,
    identificacion,
    nombre,
    telefono,
    correo,
    fecha_inicio,
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
    fecha_inicio,
    null,
    null,
  );
};

//TODO
//Replace string call with enum call
export const getAll = async (
  include_retired: boolean,
): Promise<People[]> => {
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
      DIRECCION_RESIDENCIA,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_RETIRO, 'YYYY-MM-DD'),
      TO_CHAR(EXPEDICION_TARJETA_PROFESIONAL, 'YYYY-MM-DD')
    FROM ${TABLE}
    ${
      include_retired
        ? ""
        : `WHERE COALESCE(FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE`
    }`,
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
    string | null,
    string | null,
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
      DIRECCION_RESIDENCIA,
      TO_CHAR(FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(FEC_RETIRO, 'YYYY-MM-DD'),
      TO_CHAR(EXPEDICION_TARJETA_PROFESIONAL, 'YYYY-MM-DD')
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
      string | null,
      string | null,
      string | null,
    ],
  );
};

export const findReviewById = async (
  id: number,
): Promise<PeopleReview | null> => {
  const { rows } = await postgres.query(
    `SELECT
      P.PK_PERSONA,
      P.TIPO_IDENTIFICACION::VARCHAR,
      P.IDENTIFICACION,
      TO_CHAR(P.FEC_EXPEDICION_IDENTIFICACION, 'YYYY-MM-DD'),
      P.FK_CIUDAD_EXPEDICION_IDENTIFICACION,
      P.NOMBRE,
      P.TELEFONO,
      P.CORREO,
      TO_CHAR(P.FEC_NACIMIENTO, 'YYYY-MM-DD'),
      P.FK_CIUDAD_NACIMIENTO,
      P.LIBRETA_MILITAR,
      P.FK_GENERO,
      P.FK_ESTADO_CIVIL,
      P.CORREO_PERSONAL,
      P.TELEFONO_FIJO,
      P.TIPO_SANGRE::VARCHAR,
      P.FK_CIUDAD_RESIDENCIA,
      P.DIRECCION_RESIDENCIA,
      TO_CHAR(P.FEC_INICIO, 'YYYY-MM-DD'),
      TO_CHAR(P.FEC_RETIRO, 'YYYY-MM-DD'),
      TO_CHAR(P.EXPEDICION_TARJETA_PROFESIONAL, 'YYYY-MM-DD'),
      R1.BAN_APROBADO,
      R1.OBSERVACION,
      R2.BAN_APROBADO,
      R2.OBSERVACION,
      R3.BAN_APROBADO,
      R3.OBSERVACION
    FROM ${TABLE} P
    LEFT JOIN ${REVIEW_TABLE} R1
      ON R1.FK_DATOS = PK_PERSONA::VARCHAR
      AND R1.TIPO_FORMULARIO = $2
    LEFT JOIN ${REVIEW_TABLE} R2
      ON R2.FK_DATOS = PK_PERSONA::VARCHAR
      AND R2.TIPO_FORMULARIO = $3
    LEFT JOIN ${REVIEW_TABLE} R3
      ON R3.FK_DATOS = PK_PERSONA::VARCHAR
      AND R3.TIPO_FORMULARIO = $4
    WHERE PK_PERSONA = $1`,
    id,
    DataType.DATOS_PRINCIPALES,
    DataType.DATOS_IDENTIFICACION,
    DataType.DATOS_RESIDENCIA,
  );

  if (!rows.length) return null;

  return new PeopleReview(
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
      string | null,
      string | null,
      string | null,
      boolean | null,
      string | null,
      boolean | null,
      string | null,
      boolean | null,
      string | null,
    ],
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
  filters: { [key: string]: string },
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
    filters,
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

interface ResumeLanguageSkill {
  language: string;
  read_skill: LanguageSkill;
  write_skill: LanguageSkill;
  speak_skill: LanguageSkill;
  listen_skill: LanguageSkill;
}

interface ResumeFormation {
  title: string;
  institution: string;
  graduation_date: string;
  type: string;
}

interface ResumeLaboralExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  time: number;
}

interface ResumeProjectExperience {
  name: string;
  client: string;
  description: string;
  address: string;
  contact: string;
  contact_phone: string;
  start_date: string;
  end_date: string;
  participation: number;
  functions: string;
  roles: string[];
  tools: string[];
}

interface ResumeCertification {
  name: string;
  certification: string;
  provider: string;
  version: string;
}

interface ResumeToolDevelopmentSkill {
  tool: string;
  development_skill: ToolSkill;
}

interface ResumeTool {
  tool: string;
}

class Resume {
  constructor(
    public name: string,
    public position: string,
    public start_date: string,
    public local_experience_time: number,
    public professional_card: string | null,
    public experience_time: number,
    public language_skill: ResumeLanguageSkill[],
    public academic_formation: ResumeFormation[],
    public continuous_formation: ResumeFormation[],
    public laboral_experience: ResumeLaboralExperience[],
    public project_experience: ResumeProjectExperience[],
    public certifications: ResumeCertification[],
    public tool_development_skill: ResumeToolDevelopmentSkill[],
    public tool_installation: ResumeTool[],
    public tool_administration: ResumeTool[],
  ) {}
}

export const getResume = async (
  id: number,
  all_project_experience: boolean,
) => {
  const { rows } = await postgres.query(
    `SELECT
      P.NOMBRE AS NAME,
      C.NOMBRE_PUBLICO AS POSITION,
      TO_CHAR(P.FEC_INICIO, 'DD/MM/YYYY') AS START_DATE,
      ROUND((DATE_PART('DAY', NOW() - P.FEC_INICIO::TIMESTAMP) / 365)::NUMERIC, 1) AS LOCAL_EXPERIENCE_TIME,
      TO_CHAR(P.EXPEDICION_TARJETA_PROFESIONAL, 'DD/MM/YYYY') AS PROFESSIONAL_CARD,
      (
        SELECT
          DATE_PART('YEAR', AGE(CURRENT_DATE, MIN(FEC_INICIO)))
        FROM ${LABORAL_EXPERIENCE_TABLE}
        WHERE FK_USUARIO = P.PK_PERSONA
      ) AS EXPERIENCE_TIME,
      COALESCE(LA.DATA, '{}'::JSON[]) AS LANGUAGE_SKILL,
      COALESCE(AF.DATA, '{}'::JSON[]) AS ACADEMIC_FORMATION,
      COALESCE(CF.DATA, '{}'::JSON[]) AS CONTINUOUS_FORMATION,
      COALESCE(L.DATA, '{}'::JSON[]) AS LABORAL_EXPERIENCE,
      COALESCE(PE.DATA, '{}'::JSON[]) AS PROJECT_EXPERIENCE,
      COALESCE(CE.DATA, '{}'::JSON[]) AS CERTIFICATIONS,
      COALESCE(TD.DATA, '{}'::JSON[]) AS TOOL_DEVELOPMENT_SKILL,
      COALESCE(TI.DATA, '{}'::JSON[]) AS TOOL_INSTALLATION,
      COALESCE(TA.DATA, '{}'::JSON[]) AS TOOL_ADMINISTRATION
    FROM ${TABLE} P
    JOIN ${POSITION_ASSIGNATION_TABLE} AS AC
      ON AC.FK_PERSONA = P.PK_PERSONA
    JOIN ${POSITION_TABLE} AS C
      ON C.PK_CARGO = AC.FK_CARGO
    LEFT JOIN (
      SELECT
        LA.FK_PERSONA,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'language', L.NOMBRE,
            'read_skill', LA.ESTADO_LECTURA,
            'write_skill', LA.ESTADO_ESCRITURA,
            'speak_skill', LA.ESTADO_HABLA,
            'listen_skill', LA.ESTADO_ESCUCHA
          )
          ORDER BY
            L.NOMBRE
        ) AS DATA
      FROM ${LANGUAGE_SKILL_TABLE} LA
      JOIN ${LANGUAGE_TABLE} L
        ON L.PK_IDIOMA = LA.FK_IDIOMA
      GROUP BY
        LA.FK_PERSONA
    ) AS LA
      ON LA.FK_PERSONA = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        F.FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'title', F.TITULO,
            'institution', F.INSTITUCION,
            'graduation_date', TO_CHAR(F.FECHA_FIN, 'DD/MM/YYYY'),
            'type', N.NOMBRE
          )
          ORDER BY
            F.FECHA_FIN DESC,
            F.TITULO
        ) AS DATA
      FROM ${FORMATION_TABLE} F
      JOIN ${FORMATION_LEVEL_TABLE} N
        ON F.FK_NIVEL_FORMACION = N.PK_NIVEL
      WHERE N.TIPO_FORMACION = '${FormationType.Academica}'
      GROUP BY
        F.FK_USUARIO
    ) AS AF
      ON AF.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        F.FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'title', F.TITULO,
            'institution', F.INSTITUCION,
            'graduation_date', TO_CHAR(F.FECHA_FIN, 'DD/MM/YYYY'),
            'type', N.NOMBRE
          )
          ORDER BY
            F.FECHA_FIN DESC,
            F.TITULO
        ) AS DATA
      FROM ${FORMATION_TABLE} F
      JOIN ${FORMATION_LEVEL_TABLE} N
        ON F.FK_NIVEL_FORMACION = N.PK_NIVEL
      WHERE N.TIPO_FORMACION = '${FormationType.Continuada}'
      GROUP BY
        F.FK_USUARIO
    ) AS CF
      ON CF.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'company', EMPRESA,
            'position', CARGO,
            'start_date', TO_CHAR(FEC_INICIO, 'DD/MM/YYYY'),
            'end_date', TO_CHAR(FEC_FIN, 'DD/MM/YYYY'),
            'time', ROUND((DATE_PART('DAY', FEC_FIN::TIMESTAMP - FEC_INICIO::TIMESTAMP) / 365)::NUMERIC, 1)
          )
          ORDER BY
            FEC_INICIO DESC
        ) AS DATA
      FROM ${LABORAL_EXPERIENCE_TABLE}
      GROUP BY
        FK_USUARIO
    ) AS L
      ON L.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'name', PROYECTO,
            'client', CLIENTE,
            'description', DESCRIPCION,
            'contact', NOMBRE_CONTACTO,
            'contact_phone', TELEFONO_CONTACTO,
            'start_date', TO_CHAR(FEC_INICIO, 'DD/MM/YYYY'),
            'end_date', TO_CHAR(FEC_FIN, 'DD/MM/YYYY'),
            'participation', PORCENTAJE_PARTICIPACION,
            'functions', FUNCIONES,
            'roles', ROLES,
            'tools', ENTORNO_TECNOLOGICO
          )
          ORDER BY
            FEC_INICIO DESC
        ) AS DATA
      FROM ${PROJECT_EXPERIENCE_TABLE}
      ${all_project_experience ? "" : "WHERE BAN_PROYECTO_INTERNO = TRUE"}
      GROUP BY
        FK_USUARIO
    ) AS PE
      ON PE.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        C.FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'name', C.NOMBRE,
            'certification', PLA.NOMBRE,
            'provider', PRO.NOMBRE,
            'version', C.VERSION
          )
          ORDER BY
            PLA.NOMBRE,
            C.NOMBRE
        ) AS DATA
      FROM ${CERTIFICATION_TABLE} C
      JOIN ${CERTIFICATION_TEMPLATE_TABLE} PLA
        ON PLA.PK_PLANTILLA = C.FK_PLANTILLA
      JOIN ${CERTIFICATION_PROVIDER_TABLE} PRO
        ON PRO.PK_PROVEEDOR = PLA.FK_PROVEEDOR
      GROUP BY
        C.FK_USUARIO
    ) AS CE
      ON CE.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        TS.FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'tool', T.NOMBRE,
            'development_skill', TS.DESARROLLO
          )
          ORDER BY
            T.NOMBRE
        ) AS DATA
      FROM ${TOOL_SKILL_TABLE} TS
      JOIN ${TOOL_TABLE} T
        ON T.PK_HERRAMIENTA = TS.FK_HERRAMIENTA
      GROUP BY
        TS.FK_USUARIO
    ) AS TD
      ON TD.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        TS.FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'tool', T.NOMBRE
          )
          ORDER BY
            T.NOMBRE
        ) AS DATA
      FROM ${TOOL_SKILL_TABLE} TS
      JOIN ${TOOL_TABLE} T
        ON T.PK_HERRAMIENTA = TS.FK_HERRAMIENTA
      WHERE
        TS.INSTALACION = TRUE
      GROUP BY
        TS.FK_USUARIO
    ) AS TI
      ON TI.FK_USUARIO = P.PK_PERSONA
    LEFT JOIN (
      SELECT
        TS.FK_USUARIO,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'tool', T.NOMBRE
          )
          ORDER BY
            T.NOMBRE
        ) AS DATA
      FROM ${TOOL_SKILL_TABLE} TS
      JOIN ${TOOL_TABLE} T
        ON T.PK_HERRAMIENTA = TS.FK_HERRAMIENTA
      WHERE
        TS.ADMINISTRACION = TRUE
      GROUP BY
        TS.FK_USUARIO
    ) AS TA
      ON TA.FK_USUARIO = P.PK_PERSONA
    WHERE P.PK_PERSONA = $1`,
    id,
  );

  if (!rows.length) {
    return null;
  }

  return new Resume(
    ...rows[0] as [
      string,
      string,
      string,
      number,
      string | null,
      number,
      ResumeLanguageSkill[],
      ResumeFormation[],
      ResumeFormation[],
      ResumeLaboralExperience[],
      ResumeProjectExperience[],
      ResumeCertification[],
      ResumeToolDevelopmentSkill[],
      ResumeTool[],
      ResumeTool[],
    ],
  );
};
