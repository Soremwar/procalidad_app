import postgres from "../../services/postgres.js";

export const TABLE = "ORGANIZACION.CONTROL_CIERRE_SEMANA";

class WeekControl {
  constructor(
    public readonly id: number,
    public person: number,
    public week: number,
    public status: boolean,
    public close_date: Date,
  ) {}

  async update(
    person: number = this.person,
    week: number = this.week,
    status: boolean = this.status,
    close_date: Date = this.close_date,
  ): Promise<WeekControl> {
    Object.assign(this, {
      person,
      week,
      status,
      close_date,
    });

    await postgres.query(
      `UPDATE ${TABLE}
      SET
        FK_PERSONA = $2,
        FK_SEMANA = $3,
        BAN_ESTADO = $4,
        FECHA_CIERRE = $5
      WHERE PK_CIERRE_SEMANA = $1`,
      this.id,
      this.person,
      this.week,
      this.status,
      this.close_date,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE} WHERE PK_PRESUPUESTO = $1`,
      this.id,
    );
  }
}

export const findAll = async (): Promise<WeekControl[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CIERRE_SEMANA,
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    number,
    number,
    boolean,
    Date,
  ]) => new WeekControl(...row));
};

export const findById = async (id: number): Promise<WeekControl | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_CIERRE_SEMANA,
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    FROM ${TABLE}
    WHERE PK_PRESUPUESTO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    number,
    number,
    boolean,
    Date,
  ] = rows[0];

  return new WeekControl(...result);
};

export const createNew = async (
  person: number,
  week: number,
  status: boolean,
  close_date: Date,
): Promise<WeekControl> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_PERSONA,
      FK_SEMANA,
      BAN_ESTADO,
      FECHA_CIERRE
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING PK_CIERRE_SEMANA`,
    person,
    week,
    status,
    close_date,
  );

  const id: number = rows[0][0];

  return new WeekControl(
    id,
    person,
    week,
    status,
    close_date,
  );
};
