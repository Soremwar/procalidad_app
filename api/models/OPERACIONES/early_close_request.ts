import postgres from "../../services/postgres.js";
import { TABLE as ACCESS_TABLE } from "../MAESTRO/access.ts";
import { TABLE as POSITION_ASSIGNATION_TABLE } from "../ORGANIZACION/asignacion_cargo.ts";
import { TABLE as PEOPLE_TABLE } from "../ORGANIZACION/people.ts";
import { TABLE as SUB_AREA_TABLE } from "../ORGANIZACION/sub_area.ts";
import { TABLE as WEEK_CONTROL_TABLE } from "../OPERACIONES/control_semana.ts";
import { TABLE as REGISTRY_TABLE } from "./registro.ts";
import { Profiles } from "../../common/profiles.ts";

export const TABLE = "OPERACIONES.SOLICITUD_CIERRE_SEMANA";

export class EarlyCloseRequest {
  constructor(
    public readonly id: number,
    public readonly week_control: number,
    public readonly message: string,
    public readonly request_date: Date,
  ) {}

  static async isTaken(
    week_control: number,
  ): Promise<boolean> {
    const { rows } = await postgres.query(
      `SELECT
        1
      FROM ${TABLE}
      WHERE FK_CONTROL_SEMANA = $1`,
      week_control,
    );

    return !!rows.length;
  }

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_SOLICITUD = $1`,
      this.id,
    );
  }
}

export const create = async (
  week_control: number,
  message: string,
): Promise<EarlyCloseRequest> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_CONTROL_SEMANA,
      DESCRIPCION,
      FEC_SOLICITUD
    ) VALUES (
      $1,
      $2,
      NOW()
    ) RETURNING
      PK_SOLICITUD,
      FEC_SOLICITUD`,
    week_control,
    message,
  );

  const id: number = rows[0][0];
  const request_date = new Date(rows[0][1]);

  return new EarlyCloseRequest(
    id,
    week_control,
    message,
    request_date,
  );
};

export const findById = async (id: number): Promise<EarlyCloseRequest> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SOLICITUD,
      FK_CONTROL_SEMANA,
      DESCRIPCION,
      FEC_SOLICITUD
    FROM ${TABLE}
    WHERE PK_SOLICITUD = $1`,
    id,
  );

  return new EarlyCloseRequest(
    ...rows[0] as [
      number,
      number,
      string,
      Date,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly description: string,
    public readonly week_id: number,
    public readonly current_hours: number,
    public readonly person: string,
  ) {
  }
}

export const getTableData = async (supervisor: number) => {
  const { rows } = await postgres.query(
    `WITH ADMIN_USERS AS (
      SELECT
        FK_PERSONA AS USERS
        FROM ${ACCESS_TABLE} WHERE FK_PERMISO IN (
            $1,
            $2
      )
    ),SUPERVISOR AS (
      SELECT
        AC.FK_PERSONA AS PERSON,
        UNNEST(ARRAY_CAT(
              ARRAY[SA.FK_SUPERVISOR],
              (SELECT ARRAY_AGG(USERS) FROM ADMIN_USERS)
            )) AS ID
      FROM ${POSITION_ASSIGNATION_TABLE} AC
      JOIN ${SUB_AREA_TABLE} SA
        ON SA.PK_SUB_AREA = AC.FK_SUB_AREA
      GROUP BY PERSON, ID
    )
    SELECT
      PK_SOLICITUD AS ID,
      ECR.DESCRIPCION AS DESCRIPTION,
      CS.FK_SEMANA AS WEEK_ID,
      COALESCE(SUM(R.HORAS), 0),
      P.NOMBRE AS PERSON
    FROM ${TABLE} ECR
    JOIN ${WEEK_CONTROL_TABLE} CS
      ON ECR.FK_CONTROL_SEMANA = CS.PK_CONTROL
    LEFT JOIN ${REGISTRY_TABLE} R
      ON CS.PK_CONTROL = R.FK_CONTROL_SEMANA
    JOIN ${PEOPLE_TABLE} P
      ON CS.FK_PERSONA = P.PK_PERSONA
    JOIN SUPERVISOR ER
      ON CS.FK_PERSONA = ER.PERSON
    WHERE ER.ID = $3
    GROUP BY
      PK_SOLICITUD,
      ECR.DESCRIPCION,
      CS.FK_SEMANA,
      P.NOMBRE`,
    Profiles.ADMINISTRATOR,
    Profiles.CONTROLLER,
    supervisor,
  );

  return rows.map((row: [
    number,
    string,
    number,
    number,
    string,
  ]) => new TableData(...row));
};
