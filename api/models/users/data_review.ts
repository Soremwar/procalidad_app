import postgres from "../../services/postgres.js";

export const TABLE = "USUARIOS.REVISION_CAMBIOS";

export enum DataType {
  DATOS_PRINCIPALES = "DATOS_PRINCIPALES",
  DATOS_RESIDENCIA = "DATOS_RESIDENCIA",
  DATOS_IDENTIFICACION = "DATOS_IDENTIFICACION",
  DATOS_SOPORTES = "DATOS_SOPORTES",
  FORMACION = "FORMACION",
  EXPERIENCIA_LABORAL = "EXPERIENCIA_LABORAL",
  EXPERIENCIA_PROYECTO = "EXPERIENCIA_PROYECTO",
  CERTIFICACION = "CERTIFICACION",
}

class DataReview {
  constructor(
    public readonly id: number,
    public readonly type: DataType,
    public readonly data_reference: string,
    public reviewer: number | null,
    public comments: string | null,
    public approved: boolean,
    public creation: Date,
    public last_update: Date,
  ) {}

  /**
   * Clears comments, marks as approved and sets the update date
   * @param reviewer Reviewer who approved the changes
   */
  async approve(
    reviewer: number,
  ) {
    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        FK_RESPONSABLE_REVISION = $2,
        OBSERVACION = NULL,
        BAN_APROBADO = TRUE,
        FEC_ACTUALIZACION = NOW()
      WHERE PK_REVISION = $1
      RETURNING FEC_ACTUALIZACION`,
      this.id,
      reviewer,
    );

    this.last_update = new Date(rows[0][0]);

    return this;
  }

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_REVISION = $1`,
      this.id,
    );
  }

  /**
   * Clears the comments and the reviewer, marks as not approved and sets the update date
   */
  async requestReview() {
    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        FK_RESPONSABLE_REVISION = NULL,
        OBSERVACION = NULL,
        BAN_APROBADO = FALSE,
        FEC_ACTUALIZACION = NOW()
      WHERE PK_REVISION = $1
      RETURNING FEC_ACTUALIZACION`,
      this.id,
    );

    this.last_update = new Date(rows[0][0]);

    return this;
  }

  /**
   * Updates the comments, the reviewer, and sets the update date
   * 
   * Will only update comments on **non-approved** reviews
   */
  async updateComments(
    reviewer: number,
    comments: string,
  ) {
    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        FK_RESPONSABLE_REVISION = $2,
        OBSERVACION = $3,
        FEC_ACTUALIZACION = NOW()
      WHERE PK_REVISION = $1
      AND BAN_APROBADO = FALSE
      RETURNING FEC_ACTUALIZACION`,
      this.id,
      reviewer,
      comments,
    );

    Object.assign(this, {
      reviewer,
      comments,
      last_update: new Date(rows[0][0]),
    });

    return this;
  }
}

export const create = async (
  type: DataType,
  data_reference: string,
) => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      TIPO_FORMULARIO,
      FK_DATOS,
      FK_RESPONSABLE_REVISION,
      OBSERVACION,
      BAN_APROBADO,
      FEC_CREACION,
      FEC_ACTUALIZACION
    ) VALUES (
      $1,
      $2,
      NULL,
      NULL,
      FALSE,
      NOW(),
      NOW()
    ) RETURNING PK_REVISION, FEC_CREACION`,
    type,
    data_reference,
  );

  const id: number = rows[0][0];
  const creation_date = new Date(rows[0][1]);

  return new DataReview(
    id,
    type,
    data_reference,
    null,
    null,
    false,
    creation_date,
    creation_date,
  );
};

export const findByTypeAndData = async (
  type: DataType,
  data_reference: string,
) => {
  const { rows } = await postgres.query(
    `SELECT
      PK_REVISION,
      TIPO_FORMULARIO::VARCHAR,
      FK_DATOS,
      FK_RESPONSABLE_REVISION,
      OBSERVACION,
      BAN_APROBADO,
      FEC_CREACION,
      FEC_ACTUALIZACION
    FROM ${TABLE}
    WHERE TIPO_FORMULARIO = $1
    AND FK_DATOS = $2`,
    type,
    data_reference,
  );

  if (!rows.length) return null;

  return new DataReview(
    ...rows[0] as [
      number,
      DataType,
      string,
      number,
      string,
      boolean,
      Date,
      Date,
    ],
  );
};
