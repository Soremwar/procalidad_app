import postgres from "../../services/postgres.js";
import { TABLE as ACCESS_TABLE } from "../MAESTRO/access.ts";
import { TABLE as POSITION_ASSIGNATION_TABLE } from "../ORGANIZACION/asignacion_cargo.ts";
import { TABLE as PEOPLE_TABLE } from "../ORGANIZACION/people.ts";
import { TABLE as SUB_AREA_TABLE } from "../ORGANIZACION/sub_area.ts";
import { TABLE as WEEK_CONTROL_TABLE } from "../OPERACIONES/control_semana.ts";
import { Profiles } from "../../common/profiles.ts";

export const TABLE = "OPERACIONES.SOLICITUD_CIERRE_SEMANA";

export class EarlyCloseRequest {
  constructor(
    public readonly id: number,
    public readonly week_control: number,
    public readonly message: string,
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
      DESCRIPCION
    ) VALUES (
      $1,
      $2
    ) RETURNING PK_SOLICITUD`,
    week_control,
    message,
  );

  const id: number = rows[0][0];

  return new EarlyCloseRequest(id, week_control, message);
};

export const findById = async (id: number): Promise<EarlyCloseRequest> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_SOLICITUD,
      FK_CONTROL_SEMANA,
      DESCRIPCION
    FROM ${TABLE}
    WHERE PK_SOLICITUD = $1`,
    id,
  );

  return new EarlyCloseRequest(
    ...rows[0] as [
      number,
      number,
      string,
    ],
  );
};

class TableData {
  constructor(
    public readonly id: number,
    public readonly description: string,
    public readonly week_id: number,
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
      DESCRIPCION AS DESCRIPTION,
      CS.FK_PERSONA AS PERSON_ID,
      P.NOMBRE AS PERSON
    FROM ${TABLE} ECR
    JOIN ${WEEK_CONTROL_TABLE} CS
      ON ECR.FK_CONTROL_SEMANA = CS.PK_CONTROL
    JOIN ${PEOPLE_TABLE} P
      ON CS.FK_PERSONA = P.PK_PERSONA
    JOIN SUPERVISOR ER
      ON CS.FK_PERSONA = ER.PERSON
    WHERE ER.ID = $3`,
    Profiles.ADMINISTRATOR,
    Profiles.CONTROLLER,
    supervisor,
  );

  return rows.map((row: [
    number,
    string,
    number,
    string,
  ]) => new TableData(...row));
};
