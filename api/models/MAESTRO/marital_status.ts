import postgres from "../../services/postgres.ts";

export const TABLE = "MAESTRO.ESTADO_CIVIL";

class MaritalStatus {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}
}

export const findAll = async (): Promise<MaritalStatus[]> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ESTADO_CIVIL,
      NOMBRE
    FROM ${TABLE}`,
  );

  return rows.map((row: [
    number,
    string,
  ]) => new MaritalStatus(...row));
};

export const findById = async (id: number): Promise<MaritalStatus | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ESTADO_CIVIL,
      NOMBRE
    FROM ${TABLE}
    WHERE PK_ESTADO_CIVIL = $1`,
    id,
  );

  if (!rows.length) return null;

  return new MaritalStatus(
    ...rows[0] as [
      number,
      string,
    ],
  );
};
