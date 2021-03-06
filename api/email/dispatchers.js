import { sendNewEmail } from "../services/smtp.js";
import postgres from "../services/postgres.ts";
import {
  createAssignationRequestEmail,
  createAssignationRequestReviewEmail,
  createCertificationExpirationEmail,
  createEarlyCloseRequestEmail,
  createEarlyCloseRequestReviewEmail,
  createHumanResourcesReviewEmail,
  createHumanResourcesReviewRequestEmail,
  createRegistryDelayedSubAreaEmail,
  createRegistryDelayedUserEmail,
} from "./templates.js";
import {
  TABLE as ASSIGNATION_REQUEST_TABLE,
} from "../models/OPERACIONES/asignacion_solicitud.ts";
import {
  TABLE as WEEK_CONTROL_TABLE,
} from "../models/OPERACIONES/control_semana.ts";
import { TABLE as BUDGET_TABLE } from "../models/OPERACIONES/budget.ts";
import { TABLE as PROJECT_TABLE } from "../models/OPERACIONES/PROYECTO.ts";
import { TABLE as CLIENT_TABLE } from "../models/CLIENTES/CLIENTE.ts";
import { TABLE as ROLE_TABLE } from "../models/OPERACIONES/ROL.ts";
import { TABLE as PERSON_TABLE } from "../models/ORGANIZACION/people.ts";
import { TABLE as AREA_TYPE_TABLE } from "../models/ORGANIZACION/area_type.ts";
import { TABLE as AREA_TABLE } from "../models/ORGANIZACION/AREA.ts";
import { TABLE as SUB_AREA_TABLE } from "../models/ORGANIZACION/sub_area.ts";
import {
  TABLE as POSITION_ASSIGNATION_TABLE,
} from "../models/ORGANIZACION/asignacion_cargo.ts";
import { TABLE as WEEK_TABLE } from "../models/MAESTRO/dim_semana.ts";
import { TABLE as REGISTRY_TABLE } from "../models/OPERACIONES/registro.ts";
import { TABLE as EARLY_CLOSE_REQUEST_TABLE } from "../models/OPERACIONES/early_close_request.ts";
import { Profiles } from "../common/profiles.ts";
import { getFileFormatCode } from "../parameters.ts";

//TODO
//Emails should be queueable and cancellable

export const dispatchAssignationRequested = async (assignation_request) => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(TO_DATE(ASO.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      REQ.NOMBRE AS REQUESTANT_NAME,
      REQ.CORREO AS REQUESTANT_EMAIL,
      (SELECT NOMBRE FROM ${CLIENT_TABLE} WHERE PK_CLIENTE = PRO.FK_CLIENTE) AS CLIENT,
      PRO.NOMBRE AS PROJECT,
      SUP.NOMBRE AS SUPERVISOR_NAME,
      SUP.CORREO AS SUPERVISOR_EMAIL,
      ROL.NOMBRE AS ROLE,
      ASO.HORAS AS HOURS,
      ASO.DESCRIPCION AS DESCRIPTION
    FROM ${ASSIGNATION_REQUEST_TABLE} ASO
    JOIN ${BUDGET_TABLE} PRE
      ON PRE.PK_PRESUPUESTO = ASO.FK_PRESUPUESTO
    JOIN ${PROJECT_TABLE} PRO
      ON PRO.PK_PROYECTO = PRE.FK_PROYECTO
    JOIN ${ROLE_TABLE} ROL
      ON ROL.PK_ROL = ASO.FK_ROL
    JOIN ${PERSON_TABLE} AS REQ
      ON REQ.PK_PERSONA = ASO.FK_PERSONA
    JOIN ${PERSON_TABLE} AS SUP
      ON SUP.PK_PERSONA = PRO.FK_SUPERVISOR
    WHERE ASO.PK_SOLICITUD = $1`,
    assignation_request,
  );

  const [
    date,
    requestant_name,
    requestant_email,
    client,
    project,
    supervisor_name,
    supervisor_email,
    role,
    hours,
    description,
  ] = rows[0];

  const email_content = await createAssignationRequestEmail(
    client,
    date,
    hours,
    description,
    project,
    requestant_name,
    role,
    supervisor_name,
  );

  //TODO
  //Should be the same mail with copy to requestant

  await sendNewEmail(
    supervisor_email,
    "Solicitud de Asignación",
    email_content,
  );

  await sendNewEmail(
    requestant_email,
    "Solicitud de Asignación",
    email_content,
  );
};

export const dispatchAssignationRequestReviewed = async (
  assignation_request,
  approved,
  reason,
) => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(TO_DATE(ASO.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      REQ.CORREO AS REQUESTANT_EMAIL,
      REQ.NOMBRE AS REQUESTANT_NAME,
      SUP.NOMBRE AS SUPERVISOR_NAME,
      (SELECT NOMBRE FROM ${CLIENT_TABLE} WHERE PK_CLIENTE = PRO.FK_CLIENTE) AS CLIENT,
      PRO.NOMBRE AS PROJECT,
      ROL.NOMBRE AS ROLE,
      ASO.HORAS AS HOURS,
      ASO.DESCRIPCION AS DESCRIPTION
    FROM ${ASSIGNATION_REQUEST_TABLE} ASO
    JOIN ${BUDGET_TABLE} PRE
      ON PRE.PK_PRESUPUESTO = ASO.FK_PRESUPUESTO
    JOIN ${PROJECT_TABLE} PRO
      ON PRO.PK_PROYECTO = PRE.FK_PROYECTO
    JOIN ${ROLE_TABLE} ROL
      ON ROL.PK_ROL = ASO.FK_ROL
    JOIN ${PERSON_TABLE} REQ
      ON REQ.PK_PERSONA = ASO.FK_PERSONA
    JOIN ${PERSON_TABLE} SUP
      ON SUP.PK_PERSONA = PRO.FK_SUPERVISOR
    WHERE ASO.PK_SOLICITUD = $1`,
    assignation_request,
  );

  const [
    date,
    requestant_email,
    requestant_name,
    supervisor_name,
    client,
    project,
    role,
    hours,
    description,
  ] = rows[0];

  const email_content = await createAssignationRequestReviewEmail(
    approved,
    date,
    hours,
    description,
    client,
    project,
    reason,
    requestant_name,
    role,
    supervisor_name,
  );

  await sendNewEmail(
    requestant_email,
    `Solicitud de asignación ${approved ? "Aprobada" : "Rechazada"}`,
    email_content,
  );
};

export const dispatchRegistryDelayedUsers = async () => {
  const { rows } = await postgres.query(
    `SELECT
      P.NOMBRE AS PERSON_NAME,
      P.CORREO AS PERSON_EMAIL,
      TO_CHAR(DS.FECHA_INICIO, 'YYYY-MM-DD') AS START_DATE,
      TO_CHAR(DS.FECHA_FIN, 'YYYY-MM-DD') AS END_DATE
    FROM ${WEEK_CONTROL_TABLE} CS
    JOIN ${WEEK_TABLE} DS
      ON DS.PK_SEMANA = CS.FK_SEMANA
    JOIN ${PERSON_TABLE} P
      ON P.PK_PERSONA = CS.FK_PERSONA
    WHERE COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
    AND CS.BAN_CERRADO = FALSE
    AND FECHA_FIN < CURRENT_DATE
    AND P.PK_PERSONA IN (
      SELECT FK_PERSONA
      FROM ${POSITION_ASSIGNATION_TABLE} AC
      WHERE FK_SUB_AREA IN (
        SELECT SA.PK_SUB_AREA
        FROM ${AREA_TYPE_TABLE} TA
        JOIN ${AREA_TABLE} A
          ON TA.PK_TIPO = A.FK_TIPO_AREA 
        JOIN ${SUB_AREA_TABLE} SA 
          ON A.PK_AREA = SA.FK_AREA
        WHERE TA.BAN_REGISTRABLE = TRUE
      )
    )`,
  );

  for (
    const [
      person_name,
      person_email,
      start_date,
      end_date,
    ] of rows
  ) {
    const email_content = await createRegistryDelayedUserEmail(
      person_name,
      start_date,
      end_date,
    );

    await sendNewEmail(
      person_email,
      `Notificación demora en Registro`,
      email_content,
    );
  }
};

export const dispatchRegistryDelayedSubAreas = async () => {
  const { rows } = await postgres.query(
    `SELECT
      P.CORREO AS SUPERVISOR_EMAIL,
      SA.NOMBRE AS SUB_AREA,
      ARRAY_AGG(R.DATA) AS DELAYED_USERS
    FROM ${SUB_AREA_TABLE} SA
    JOIN (
      SELECT
        AC.FK_SUB_AREA,
        JSON_BUILD_OBJECT(
          'name', P.NOMBRE,
          'week', TO_CHAR(DS.FECHA_INICIO, 'YYYY-MM-DD')
        ) AS DATA
      FROM ${WEEK_CONTROL_TABLE} CS
      JOIN ${PERSON_TABLE} AS P
        ON CS.FK_PERSONA = P.PK_PERSONA
      JOIN ${WEEK_TABLE} DS
        ON DS.PK_SEMANA = CS.FK_SEMANA
      JOIN ${POSITION_ASSIGNATION_TABLE} AC
        ON AC.FK_PERSONA = CS.FK_PERSONA
      JOIN ${SUB_AREA_TABLE} SA
        ON SA.PK_SUB_AREA = AC.FK_SUB_AREA
      JOIN ${AREA_TABLE} A
        ON A.PK_AREA = SA.FK_AREA
      JOIN ${AREA_TYPE_TABLE} AT
        ON AT.PK_TIPO = A.FK_TIPO_AREA
      WHERE 1 =1 --COALESCE(P.FEC_RETIRO, TO_DATE('2099-12-31', 'YYYY-MM-DD')) >= CURRENT_DATE
      AND AT.BAN_REGISTRABLE = TRUE
      AND CS.BAN_CERRADO = FALSE
      AND DS.FECHA_FIN < CURRENT_DATE
    ) R
    ON SA.PK_SUB_AREA = R.FK_SUB_AREA
    JOIN ${PERSON_TABLE} AS P
      ON SA.FK_SUPERVISOR = P.PK_PERSONA
    GROUP BY
      P.CORREO,
      SA.NOMBRE`,
  );

  for (
    const [
      supervisor_email,
      sub_area,
      delayed_users,
    ] of rows
  ) {
    await sendNewEmail(
      supervisor_email,
      `Notificacion de retraso en Subarea: ${sub_area}`,
      await createRegistryDelayedSubAreaEmail(
        delayed_users,
      ),
    );
  }
};

export const dispatchHumanResourcesReviewRequested = async (
  review_id,
) => {
  const support_file = await getFileFormatCode();

  const { rows: review } = await postgres.query(
    `WITH REQUEST_USER AS (
      SELECT
        COALESCE(F.FK_USUARIO, EL.FK_USUARIO, EP.FK_USUARIO, P.PK_PERSONA, C.FK_USUARIO, AP.FK_USUARIO) AS FK_USUARIO,
        CASE
          WHEN NF.TIPO_FORMACION IS NOT NULL THEN UPPER(NF.TIPO_FORMACION::VARCHAR)
          ELSE RC.TIPO_FORMULARIO::VARCHAR
        END AS FORMULARIO
      FROM USUARIOS.REVISION_CAMBIOS RC
      LEFT JOIN USUARIOS.FORMACION F
        ON RC.FK_DATOS = F.PK_FORMACION::VARCHAR
        AND RC.TIPO_FORMULARIO = 'FORMACION'
      LEFT JOIN USUARIOS.NIVEL_FORMACION NF
        ON F.FK_NIVEL_FORMACION = NF.PK_NIVEL
      LEFT JOIN USUARIOS.EXPERIENCIA_LABORAL EL
        ON RC.FK_DATOS = EL.PK_EXPERIENCIA::VARCHAR
        AND RC.TIPO_FORMULARIO = 'EXPERIENCIA_LABORAL'
      LEFT JOIN USUARIOS.EXPERIENCIA_PROYECTO EP 
        ON RC.FK_DATOS = EP.PK_EXPERIENCIA::VARCHAR
        AND RC.TIPO_FORMULARIO = 'EXPERIENCIA_PROYECTO'
      LEFT JOIN ORGANIZACION.PERSONA P
        ON RC.FK_DATOS = P.PK_PERSONA::VARCHAR
        AND RC.TIPO_FORMULARIO IN ('DATOS_RESIDENCIA', 'DATOS_IDENTIFICACION', 'DATOS_PRINCIPALES')
      LEFT JOIN USUARIOS.CERTIFICACION C 
        ON RC.FK_DATOS = C.PK_CERTIFICACION::VARCHAR
        AND RC.TIPO_FORMULARIO = 'CERTIFICACION'
      LEFT JOIN ARCHIVOS.ARCHIVO_PLANTILLA AP 
      	ON RC.FK_DATOS = AP.FK_USUARIO||'_'||AP.FK_PLANTILLA
      	AND AP.FK_PLANTILLA IN (SELECT PK_PLANTILLA FROM ARCHIVOS.PLANTILLA WHERE FK_FORMATO = $2)
      	AND RC.TIPO_FORMULARIO = 'DATOS_SOPORTES'
      WHERE RC.PK_REVISION = $1
    )
    SELECT
      P.NOMBRE AS REQUESTANT_NAME,
      CASE
        WHEN RU.FORMULARIO = 'ACADEMICA' THEN 'Formación academica'
        WHEN RU.FORMULARIO = 'CONTINUADA' THEN 'Formación continuada'
        WHEN RU.FORMULARIO = 'CAPACITACIONES' THEN 'Capacitaciones internas'
        WHEN RU.FORMULARIO = 'EXPERIENCIA_LABORAL' THEN 'Experiencia laboral'
        WHEN RU.FORMULARIO = 'EXPERIENCIA_PROYECTO' THEN 'Experiencia en proyectos'
        WHEN RU.FORMULARIO = 'CERTIFICACION' THEN 'Certificaciones'
        WHEN RU.FORMULARIO = 'DATOS_SOPORTES' THEN 'Datos personales - Soportes'
        WHEN RU.FORMULARIO = 'DATOS_RESIDENCIA' THEN 'Datos personales - Residencia'
        WHEN RU.FORMULARIO = 'DATOS_IDENTIFICACION' THEN 'Datos personales - Identificación'
        WHEN RU.FORMULARIO = 'DATOS_PRINCIPALES' THEN 'Datos personales'
        ELSE 'Formulario no registrado'
      END AS FORMULARY
    FROM REQUEST_USER RU
    JOIN ORGANIZACION.PERSONA P
      ON RU.FK_USUARIO = P.PK_PERSONA`,
    review_id,
    support_file,
  );

  const [
    requestant_name,
    formulary,
  ] = review[0];

  const email_content = await createHumanResourcesReviewRequestEmail(
    requestant_name,
    formulary,
  );

  const { rows: reviewers } = await postgres.query(
    `SELECT
      P.CORREO
    FROM MAESTRO.ACCESO A
    JOIN ORGANIZACION.PERSONA P 
      ON A.FK_PERSONA = P.PK_PERSONA
    WHERE FK_PERMISO = $1`,
    Profiles.HUMAN_RESOURCES,
  );

  for (const [email] of reviewers) {
    await sendNewEmail(
      email,
      "Revisión de hoja de vida",
      email_content,
    );
  }
};

export const dispatchHumanResourcesReview = async (
  review_id,
) => {
  const support_file = await getFileFormatCode();

  const { rows: review } = await postgres.query(
    `WITH REQUEST_USER AS (
      SELECT
        COALESCE(F.FK_USUARIO, EL.FK_USUARIO, EP.FK_USUARIO, P.PK_PERSONA, C.FK_USUARIO, AP.FK_USUARIO) AS FK_USUARIO,
        RC.FK_RESPONSABLE_REVISION AS FK_RESPONSABLE,
        RC.BAN_APROBADO AS APROBADO,
        RC.OBSERVACION AS OBSERVACION,
        CASE
          WHEN NF.TIPO_FORMACION IS NOT NULL THEN UPPER(NF.TIPO_FORMACION::VARCHAR)
          ELSE RC.TIPO_FORMULARIO::VARCHAR
        END AS FORMULARIO
      FROM USUARIOS.REVISION_CAMBIOS RC
      LEFT JOIN USUARIOS.FORMACION F
        ON RC.FK_DATOS = F.PK_FORMACION::VARCHAR
        AND RC.TIPO_FORMULARIO = 'FORMACION'
      LEFT JOIN USUARIOS.NIVEL_FORMACION NF
        ON F.FK_NIVEL_FORMACION = NF.PK_NIVEL
      LEFT JOIN USUARIOS.EXPERIENCIA_LABORAL EL
        ON RC.FK_DATOS = EL.PK_EXPERIENCIA::VARCHAR
        AND RC.TIPO_FORMULARIO = 'EXPERIENCIA_LABORAL'
      LEFT JOIN USUARIOS.EXPERIENCIA_PROYECTO EP 
        ON RC.FK_DATOS = EP.PK_EXPERIENCIA::VARCHAR
        AND RC.TIPO_FORMULARIO = 'EXPERIENCIA_PROYECTO'
      LEFT JOIN ORGANIZACION.PERSONA P
        ON RC.FK_DATOS = P.PK_PERSONA::VARCHAR
        AND RC.TIPO_FORMULARIO IN ('DATOS_RESIDENCIA', 'DATOS_IDENTIFICACION', 'DATOS_PRINCIPALES')
      LEFT JOIN USUARIOS.CERTIFICACION C 
        ON RC.FK_DATOS = C.PK_CERTIFICACION::VARCHAR
        AND RC.TIPO_FORMULARIO = 'CERTIFICACION'
      LEFT JOIN ARCHIVOS.ARCHIVO_PLANTILLA AP 
      	ON RC.FK_DATOS = AP.FK_USUARIO||'_'||AP.FK_PLANTILLA
      	AND AP.FK_PLANTILLA IN (SELECT PK_PLANTILLA FROM ARCHIVOS.PLANTILLA WHERE FK_FORMATO = $2)
      	AND RC.TIPO_FORMULARIO = 'DATOS_SOPORTES'
      WHERE RC.PK_REVISION = $1
    )
    SELECT
      PU.CORREO AS REQUESTANT_EMAIL,
      PR.NOMBRE AS REVIEWER,
      RU.APROBADO AS APPROVED,
      RU.OBSERVACION AS COMMENTS,
      CASE
        WHEN RU.FORMULARIO = 'ACADEMICA' THEN 'Formación academica'
        WHEN RU.FORMULARIO = 'CONTINUADA' THEN 'Formación continuada'
        WHEN RU.FORMULARIO = 'CAPACITACIONES' THEN 'Capacitaciones internas'
        WHEN RU.FORMULARIO = 'EXPERIENCIA_LABORAL' THEN 'Experiencia laboral'
        WHEN RU.FORMULARIO = 'EXPERIENCIA_PROYECTO' THEN 'Experiencia en proyectos'
        WHEN RU.FORMULARIO = 'CERTIFICACION' THEN 'Certificaciones'
        WHEN RU.FORMULARIO = 'DATOS_SOPORTES' THEN 'Datos personales - Soportes'
        WHEN RU.FORMULARIO = 'DATOS_RESIDENCIA' THEN 'Datos personales - Residencia'
        WHEN RU.FORMULARIO = 'DATOS_IDENTIFICACION' THEN 'Datos personales - Identificación'
        WHEN RU.FORMULARIO = 'DATOS_PRINCIPALES' THEN 'Datos personales'
        ELSE 'Formulario no registrado'
      END AS FORMULARY
    FROM REQUEST_USER RU
    LEFT JOIN ORGANIZACION.PERSONA PU
      ON RU.FK_USUARIO = PU.PK_PERSONA
    LEFT JOIN ORGANIZACION.PERSONA PR
      ON RU.FK_RESPONSABLE = PR.PK_PERSONA`,
    review_id,
    support_file,
  );

  const [
    requestant_email,
    reviewer,
    approved,
    comments,
    formulary,
  ] = review[0];

  const email_content = await createHumanResourcesReviewEmail(
    reviewer,
    approved,
    comments,
    formulary,
  );

  await sendNewEmail(
    requestant_email,
    `Revisión de hoja de vida`,
    email_content,
  );
};

export const dispatchEarlyCloseRequest = async (
  request_id,
) => {
  const { rows: review } = await postgres.query(
    `SELECT
      P1.NOMBRE,
      P2.CORREO,
      TO_CHAR(DS.FECHA_INICIO, 'DD-MM-YYYY'),
      COALESCE(SUM(R.HORAS), 0)
    FROM ${EARLY_CLOSE_REQUEST_TABLE} SCS
    JOIN ${WEEK_CONTROL_TABLE} CS
      ON SCS.FK_CONTROL_SEMANA = CS.PK_CONTROL
    JOIN ${WEEK_TABLE} DS
    	ON CS.FK_SEMANA = DS.PK_SEMANA
    LEFT JOIN ${REGISTRY_TABLE} R
      ON CS.PK_CONTROL = R.FK_CONTROL_SEMANA
    JOIN ${POSITION_ASSIGNATION_TABLE} AC
      ON CS.FK_PERSONA = AC.FK_PERSONA
    JOIN ${SUB_AREA_TABLE} SA
      ON AC.FK_SUB_AREA = SA.PK_SUB_AREA
    JOIN ${PERSON_TABLE} P1
      ON P1.PK_PERSONA = CS.FK_PERSONA
    JOIN ${PERSON_TABLE} P2
      ON P2.PK_PERSONA = SA.FK_SUPERVISOR
    WHERE SCS.PK_SOLICITUD = $1
    GROUP BY
      P1.NOMBRE,
      P2.CORREO,
      DS.FECHA_INICIO`,
    request_id,
  );

  const [
    requestant_name,
    reviewer_email,
    week,
    current_hours,
  ] = review[0];

  const email_content = await createEarlyCloseRequestEmail(
    requestant_name,
    week,
    current_hours,
  );

  await sendNewEmail(
    reviewer_email,
    "Cierre de semana solicitado",
    email_content,
  );
};

export const dispatchEarlyCloseRequestReview = async (
  request_id,
  approved,
  message,
) => {
  const { rows: review } = await postgres.query(
    `SELECT
      P1.CORREO,
      P2.NOMBRE,
      TO_CHAR(DS.FECHA_INICIO, 'DD-MM-YYYY')
    FROM ${EARLY_CLOSE_REQUEST_TABLE} SCS
    JOIN ${WEEK_CONTROL_TABLE} CS
      ON SCS.FK_CONTROL_SEMANA = CS.PK_CONTROL
    JOIN ${WEEK_TABLE} DS
    	ON CS.FK_SEMANA = DS.PK_SEMANA
    JOIN ${POSITION_ASSIGNATION_TABLE} AC
      ON CS.FK_PERSONA = AC.FK_PERSONA
    JOIN ${SUB_AREA_TABLE} SA
      ON AC.FK_SUB_AREA = SA.PK_SUB_AREA
    JOIN ${PERSON_TABLE} P1
      ON P1.PK_PERSONA = CS.FK_PERSONA
    JOIN ${PERSON_TABLE} P2
      ON P2.PK_PERSONA = SA.FK_SUPERVISOR
    WHERE SCS.PK_SOLICITUD = $1`,
    request_id,
  );

  const [
    requestant_email,
    reviewer_name,
    week,
  ] = review[0];

  const email_content = await createEarlyCloseRequestReviewEmail(
    reviewer_name,
    approved,
    message,
    week,
  );

  await sendNewEmail(
    requestant_email,
    "Cierre de semana",
    email_content,
  );
};

export const dispatchCertificationExpiration = async () => {
  const { rows: review } = await postgres.query(
    `SELECT
      (SELECT CORREO FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = C.FK_USUARIO) AS USER_EMAIL,
      PC.NOMBRE AS PROVIDER,
      P.NOMBRE AS CERTIFICATION,
      T.NOMBRE AS TYPE,
      C.NOMBRE AS NAME,
      C.FEC_EXPIRACION - CURRENT_DATE AS DAYS
    FROM USUARIOS.CERTIFICACION C
    JOIN USUARIOS.TIPO_CERTIFICACION T
      ON C.FK_TIPO = T.PK_TIPO
    JOIN USUARIOS.PLANTILLA_CERTIFICACION P
      ON C.FK_PLANTILLA = P.PK_PLANTILLA
    JOIN USUARIOS.PROVEEDOR_CERTIFICACION PC
      ON P.FK_PROVEEDOR = PC.PK_PROVEEDOR
    WHERE FEC_EXPIRACION IS NOT NULL
    AND FEC_EXPIRACION < (CURRENT_DATE + INTERVAL '2 MONTH')
    AND FEC_EXPIRACION >= CURRENT_DATE`,
  );

  const [
    user_email,
    provider,
    certification,
    type,
    name,
    days,
  ] = review[0];

  const email_content = await createCertificationExpirationEmail(
    provider,
    certification,
    type,
    name,
    days,
  );

  await sendNewEmail(
    user_email,
    "Aviso de certificación: expiración",
    email_content,
  );

  //TODO
  //Should send email to supervisor
};
