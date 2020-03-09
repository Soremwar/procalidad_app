import postgres from "../../services/postgres.js";

class Cliente {
  constructor(
    public readonly pk_cliente: number,
    public fk_sector: number,
    public nit: string,
    public nombre: string,
    public direccion: string
  ) {}

  async update(
    fk_sector: number = this.fk_sector,
    nit: string = this.nit,
    nombre: string = this.nombre,
    direccion: string = this.direccion
  ): Promise<
    Cliente
  > {
    Object.assign(this, { fk_sector, nit, nombre, direccion });
    await postgres.query(
      "UPDATE CLIENTES.CLIENTE SET FK_SECTOR = $2, NIT = $3, NOMBRE = $4, DIRECCION = $5 WHERE PK_CLIENTE = $1",
      this.pk_cliente,
      this.fk_sector,
      this.nit,
      this.nombre,
      this.direccion
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM CLIENTES.CLIENTE WHERE PK_CLIENTE = $1",
      this.pk_cliente
    );
  }
}

export const findAll = async (): Promise<Cliente[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_CLIENTE, FK_SECTOR, NIT, NOMBRE, DIRECCION FROM CLIENTES.CLIENTE"
  );
  return rows.map((row: [number, number, string, string, string]) =>
    new Cliente(...row)
  );
};

export const findById = async (id: number): Promise<Cliente | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_CLIENTE, FK_SECTOR, NIT, NOMBRE, DIRECCION FROM CLIENTES.CLIENTE WHERE PK_CLIENTE = $1",
    id
  );
  if (!rows[0]) return null;
  const result: [number, number, string, string, string] = rows[0];
  return new Cliente(...result);
};

export const createNew = async (
  fk_sector: number,
  nit: string,
  nombre: string,
  direccion: string
): Promise<void> => {
  await postgres.query(
    "INSERT INTO CLIENTES.CLIENTE (FK_SECTOR, NIT, NOMBRE, DIRECCION) VALUES ($1, $2, $3, $4)",
    fk_sector,
    nit,
    nombre,
    direccion
  );
};
