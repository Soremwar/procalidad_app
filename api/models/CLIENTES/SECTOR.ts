import postgres from "../../services/postgres.js";

class Sector {
  constructor(
    public readonly pk_sector: number,
    public nombre: string
  ) {}

  async update(
    nombre: string = this.nombre
  ): Promise<
    Sector
  > {
    Object.assign(this, { nombre });
    await postgres.query(
      "UPDATE CLIENTES.SECTOR SET NOMBRE = $2 WHERE PK_SECTOR = $1",
      this.pk_sector,
      this.nombre
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM CLIENTES.SECTOR WHERE PK_SECTOR = $1",
      this.pk_sector
    );
  }
}

export const findAll = async (): Promise<Sector[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_SECTOR, NOMBRE FROM CLIENTES.SECTOR"
  );
  return rows.map((row: [number, string]) => new Sector(...row));
};

export const findById = async (id: number): Promise<Sector | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_SECTOR, NOMBRE FROM CLIENTES.SECTOR WHERE PK_SECTOR = $1",
    id
  );
  if (!rows[0]) return null;
  const result: [number, string] = rows[0];
  return new Sector(...result);
};

export const createNew = async (
  nombre: string
): Promise<void> => {
  await postgres.query(
    "INSERT INTO CLIENTES.SECTOR (NOMBRE) VALUES ($1)",
    nombre
  );
};
