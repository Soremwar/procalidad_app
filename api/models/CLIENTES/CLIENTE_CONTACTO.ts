import postgres from "../../services/postgres.js";

class ClienteContacto {
  constructor(
    public readonly fk_cliente: number,
    public readonly fk_contacto: number
  ) {}

  async delete() {
    await postgres.query(
      "DELETE FROM CLIENTES.CLIENTE_CONTACTO WHERE FK_CLIENTE = $1 AND FK_CONTACTO = $2",
      this.fk_cliente,
      this.fk_contacto
    );
  }
}

export const findAll = async (): Promise<ClienteContacto[]> => {
  const { rows } = await postgres.query(
    "SELECT FK_CLIENTE, FK_CONTACTO FROM CLIENTES.CLIENTE_CONTACTO"
  );
  return rows.map((row: [number, number]) => new ClienteContacto(...row));
};

export const findByContacto = async (contacto: number): Promise<
  ClienteContacto[]
> => {
  const { rows } = await postgres.query(
    "SELECT FK_CLIENTE, FK_CONTACTO FROM CLIENTES.CLIENTE_CONTACTO WHERE FK_CONTACTO = $1",
    contacto
  );
  return rows.map((x: [number, number]) => new ClienteContacto(...x));
};

export const findByClient = async (client: number): Promise<
  ClienteContacto[]
> => {
  const { rows } = await postgres.query(
    "SELECT FK_CLIENTE, FK_CONTACTO FROM CLIENTES.CLIENTE_CONTACTO WHERE FK_CLIENTE = $1",
    client
  );
  return rows.map((x: [number, number]) => new ClienteContacto(...x));
};

export const createNew = async (
  fk_cliente: number,
  fk_contacto: number
): Promise<void> => {
  await postgres.query(
    "INSERT INTO CLIENTES.CLIENTE_CONTACTO (FK_CLIENTE, FK_CONTACTO) VALUES ($1, $2)",
    fk_cliente,
    fk_contacto
  );
};
