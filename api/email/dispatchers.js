import {
  sendNewEmail,
} from "../services/smtp.js";
import postgres from "../services/postgres.js";
import {
  createGenericEmail,
} from "./templates.js";
import {
  TABLE as ASSIGNATION_REQUEST_TABLE,
} from "../models/OPERACIONES/asignacion_solicitud.ts";
import {
  TABLE as WEEK_CONTROL_TABLE,
} from "../models/OPERACIONES/control_semana.ts";
import {
  TABLE as BUDGET_TABLE,
} from "../models/OPERACIONES/budget.ts";
import {
  TABLE as PROJECT_TABLE,
} from "../models/OPERACIONES/PROYECTO.ts";
import {
  TABLE as ROLE_TABLE,
} from "../models/OPERACIONES/ROL.ts";
import {
  TABLE as PERSON_TABLE,
} from "../models/ORGANIZACION/PERSONA.ts";
import {
  TABLE as SUB_AREA_TABLE,
} from "../models/ORGANIZACION/sub_area.ts";
import {
  TABLE as POSITION_ASSIGNATION_TABLE,
} from "../models/ORGANIZACION/asignacion_cargo.ts";
import {
  TABLE as WEEK_TABLE,
} from "../models/MAESTRO/dim_semana.ts";

//TODO
//Emails should be queueable and cancellable

export const dispatchAssignationRequested = async (assignation_request) => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(TO_DATE(ASO.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = CS.FK_PERSONA) AS REQUESTANT,
      PRO.NOMBRE AS PROJECT,
      (SELECT CORREO FROM ${PERSON_TABLE} WHERE PK_PERSONA = PRO.FK_SUPERVISOR) AS SUPERVISOR_EMAIL,
      ROL.NOMBRE AS ROLE,
      ASO.HORAS AS HOURS,
      ASO.DESCRIPCION AS DESCRIPTION
    FROM ${ASSIGNATION_REQUEST_TABLE} ASO
    JOIN ${WEEK_CONTROL_TABLE} CS
      ON ASO.FK_CONTROL_SEMANA = CS.PK_CONTROL
    JOIN ${BUDGET_TABLE} PRE
      ON PRE.PK_PRESUPUESTO = ASO.FK_PRESUPUESTO
    JOIN ${PROJECT_TABLE} PRO
      ON PRO.PK_PROYECTO = PRE.FK_PROYECTO
    JOIN ${ROLE_TABLE} ROL
      ON ROL.PK_ROL = ASO.FK_ROL
    WHERE ASO.PK_SOLICITUD = $1`,
    assignation_request,
  );

  const [
    date,
    requestant,
    project,
    supervisor_email,
    role,
    hours,
    description,
  ] = rows[0];

  const content = (
    `${requestant} ha solicitado una nueva asignacion para la fecha ${date}.
    
    "${description}"
    
    Proyecto: ${project}
    Rol: ${role}
    Horas: ${hours}`
  );

  const email_content = await createGenericEmail(content);

  await sendNewEmail(
    supervisor_email,
    "Nueva solicitud de asignacion",
    email_content,
  );
};

export const dispatchAssignationRequestReviewed = async (
  assignation_request,
  approved,
) => {
  const { rows } = await postgres.query(
    `SELECT
      TO_CHAR(TO_DATE(ASO.FECHA::VARCHAR, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
      PER.CORREO AS REQUESTANT_EMAIL,
      PRO.NOMBRE AS PROJECT,
      ROL.NOMBRE AS ROLE,
      ASO.HORAS AS HOURS,
      ASO.DESCRIPCION AS DESCRIPTION
    FROM ${ASSIGNATION_REQUEST_TABLE} ASO
    JOIN ${WEEK_CONTROL_TABLE} CS
      ON ASO.FK_CONTROL_SEMANA = CS.PK_CONTROL
    JOIN ${PERSON_TABLE} PER
      ON PER.PK_PERSONA = CS.FK_PERSONA
    JOIN ${BUDGET_TABLE} PRE
      ON PRE.PK_PRESUPUESTO = ASO.FK_PRESUPUESTO
    JOIN ${PROJECT_TABLE} PRO
      ON PRO.PK_PROYECTO = PRE.FK_PROYECTO
    JOIN ${ROLE_TABLE} ROL
      ON ROL.PK_ROL = ASO.FK_ROL
    WHERE ASO.PK_SOLICITUD = $1`,
    assignation_request,
  );

  const [
    date,
    requestant_email,
    project,
    role,
    hours,
    description,
  ] = rows[0];

  const content = (
    `Su solicitud para la fecha ${date} ha sido ${
      approved ? "aprobada" : "rechazada"
    }.
    
    "${description}"
    
    Proyecto: ${project}
    Rol: ${role}
    Horas: ${hours}`
  );

  const email_content = await createGenericEmail(content);

  await sendNewEmail(
    requestant_email,
    `Solicitud de asignacion ${approved ? "aprobada" : "rechazada"}`,
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
    WHERE CS.BAN_CERRADO = FALSE
    AND FECHA_FIN < CURRENT_DATE`,
  );

  const emails = rows.map(async ([
    person_name,
    person_email,
    start_date,
    end_date,
  ]) => {
    const content = (
      `${person_name}, a la fecha se encuentra atrasado con su registro.
    
    La semana del ${start_date} al ${end_date} no ha sido cerrada`
    );

    await sendNewEmail(
      person_email,
      `Notificacion de retraso de registro`,
      await createGenericEmail(content),
    );
  });

  await Promise.all(emails);
};

export const dispatchRegistryDelayedAreas = async () => {
  const { rows: delayed_sub_areas } = await postgres.query(
    `SELECT
      P.CORREO AS SUPERVISOR_EMAIL,
      SA.PK_SUB_AREA AS ID_SUB_AREA
    FROM ${SUB_AREA_TABLE} SA
    JOIN ${PERSON_TABLE} P
      ON P.PK_PERSONA = SA.FK_SUPERVISOR
    WHERE PK_SUB_AREA IN (
      SELECT
        AC.FK_SUB_AREA
      FROM ${WEEK_CONTROL_TABLE} CS
      JOIN ${WEEK_TABLE} DS
        ON DS.PK_SEMANA = CS.FK_SEMANA
      JOIN ${POSITION_ASSIGNATION_TABLE} AC
        ON AC.FK_PERSONA = CS.FK_PERSONA
      WHERE CS.BAN_CERRADO = FALSE
      AND FECHA_FIN < CURRENT_DATE
    )`,
  );

  const emails = delayed_sub_areas.map(async ([
    supervisor_email,
    id_sub_area,
  ]) => {
    const { rows: delayed_users } = await postgres.query(
      `SELECT
        (SELECT NOMBRE FROM ${PERSON_TABLE} WHERE PK_PERSONA = CS.FK_PERSONA) AS PERSON_NAME,
        TO_CHAR(DS.FECHA_INICIO, 'YYYY-MM-DD') AS WEEK_DATE
      FROM ${WEEK_CONTROL_TABLE} CS
      JOIN ${WEEK_TABLE} DS
        ON DS.PK_SEMANA = CS.FK_SEMANA
      JOIN ${POSITION_ASSIGNATION_TABLE} AC
        ON AC.FK_PERSONA = CS.FK_PERSONA
      WHERE CS.BAN_CERRADO = FALSE
      AND DS.FECHA_FIN < CURRENT_DATE
      AND AC.FK_SUB_AREA = $1`,
      id_sub_area,
    );

    const content = (
      `A la fecha estas personas se encuentran atrasadas en el registro
    
    ${
        delayed_users.map(([
          person_name,
          week_date,
        ]) => `${person_name} Semana: ${week_date}`).join("\n")
      }`
    );

    await sendNewEmail(
      supervisor_email,
      `Notificacion de retraso de area`,
      await createGenericEmail(content),
    );
  });

  await Promise.all(emails);
};
