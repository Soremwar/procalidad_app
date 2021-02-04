import postgres from "../../services/postgres.ts";

export const TABLE = "MAESTRO.PERMISO";

class Profile {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
  ) {}

  async update(
    name: string = this.name,
    description: string = this.description,
  ): Promise<Profile> {
    Object.assign(this, {
      name,
      description,
    });

    await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE = $2,
        DESCRIPCION = $3
      WHERE COD_PERMISO = $1`,
      this.id,
      this.name,
      this.description,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE COD_PERMISO = $1`,
      this.id,
    );
  }
}

export const findAll = async (): Promise<Profile[]> => {
  const { rows } = await postgres.query(
    `SELECT
      COD_PERMISO,
      NOMBRE,
      DESCRIPCION
    FROM ${TABLE}`,
  );

  const models = rows.map((row: [
    number,
    string,
    string,
  ]) => new Profile(...row));

  return models;
};

export const findById = async (id: number): Promise<Profile | null> => {
  const { rows } = await postgres.query(
    `SELECT
      COD_PERMISO,
      NOMBRE,
      DESCRIPCION
    FROM ${TABLE}
    WHERE COD_PERMISO = $1`,
    id,
  );

  if (!rows[0]) return null;

  const result: [
    number,
    string,
    string,
  ] = rows[0];

  return new Profile(...result);
};

export const createNew = async (
  name: string,
  description: string,
): Promise<Profile> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      NOMBRE,
      DESCRIPCION
    ) VALUES (
      $1,
      $2
    )RETURNING COD_PERMISO`,
    name,
    description,
  );

  const id: number = rows[0][0];

  return new Profile(
    id,
    name,
    description,
  );
};
