import postgres from "../../services/postgres.js";

class Sector {
  constructor(
    public readonly pk_sector: number,
    public nombre: string,
  ) {}

  async update(
    nombre: string = this.nombre,
  ): Promise<
    Sector
  > {
    Object.assign(this, { nombre });
    await postgres.query(
      "UPDATE CLIENTES.SECTOR SET NOMBRE = $2 WHERE PK_SECTOR = $1",
      this.pk_sector,
      this.nombre,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM CLIENTES.SECTOR WHERE PK_SECTOR = $1",
      this.pk_sector,
    );
  }
}

export const findAll = async (): Promise<{ [x: number]: Sector }> => {
  const { rows } = await postgres.query(
    "SELECT PK_SECTOR, NOMBRE FROM CLIENTES.SECTOR",
  );
  const models = rows.map((row: [number, string]) => new Sector(...row));

  return models.reduce((res: { [x: number]: Sector }, x: Sector) => {
    res[x.pk_sector] = x;
    return res;
  }, new Object());
};

export const findById = async (id: number): Promise<Sector | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_SECTOR, NOMBRE FROM CLIENTES.SECTOR WHERE PK_SECTOR = $1",
    id,
  );
  if (!rows[0]) return null;
  const result: [number, string] = rows[0];
  return new Sector(...result);
};

export const createNew = async (nombre: string) => {
  await postgres.query(
    "INSERT INTO CLIENTES.SECTOR (NOMBRE) VALUES ($1)",
    nombre,
  );
};
