import { sendNewEmail } from "../services/smtp.js";
import postgres from "../services/postgres.js";
import {
  createAssignationRequestEmail,
  createAssignationRequestReviewEmail,
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
import {
  Profiles,
} from "../common/profiles.ts";

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
  const { rows: review } = await postgres.query(
    `WITH REQUEST_USER AS (
      SELECT
        COALESCE(F.FK_USUARIO, EL.FK_USUARIO, EP.FK_USUARIO, P.PK_PERSONA, C.FK_USUARIO) AS FK_USUARIO,
        CASE
          WHEN NF.TIPO_FORMACION IS NOT NULL THEN UPPER(NF.TIPO_FORMACION::VARCHAR)
          ELSE RC.TIPO_FORMULARIO::VARCHAR
        END AS FORMULARIO
      FROM USUARIOS.REVISION_CAMBIOS RC
      LEFT JOIN USUARIOS.FORMACION F
        ON RC.FK_DATOS = F.PK_FORMACION
        AND RC.TIPO_FORMULARIO = 'FORMACION'
      LEFT JOIN USUARIOS.NIVEL_FORMACION NF
        ON F.FK_NIVEL_FORMACION = NF.PK_NIVEL
      LEFT JOIN USUARIOS.EXPERIENCIA_LABORAL EL
        ON RC.FK_DATOS = EL.PK_EXPERIENCIA
        AND RC.TIPO_FORMULARIO = 'EXPERIENCIA_LABORAL'
      LEFT JOIN USUARIOS.EXPERIENCIA_PROYECTO EP 
        ON RC.FK_DATOS = EP.PK_EXPERIENCIA
        AND RC.TIPO_FORMULARIO = 'EXPERIENCIA_PROYECTO'
      LEFT JOIN ORGANIZACION.PERSONA P
        ON RC.FK_DATOS = P.PK_PERSONA
        AND RC.TIPO_FORMULARIO IN ('DATOS_RESIDENCIA', 'DATOS_IDENTIFICACION', 'DATOS_PRINCIPALES', 'DATOS_SOPORTES')
      LEFT JOIN USUARIOS.CERTIFICACION C 
        ON RC.FK_DATOS = C.PK_CERTIFICACION
        AND RC.TIPO_FORMULARIO = 'CERTIFICACION'
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
        ELSE 'Hoja de vida'
      END AS FORMULARY
    FROM REQUEST_USER RU
    JOIN ORGANIZACION.PERSONA P
      ON RU.FK_USUARIO = P.PK_PERSONA`,
      review_id,
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

  for(const [email] of reviewers){
    await sendNewEmail(
      email,
      "Solicitud de revisión",
      email_content,
    );
  }
};
