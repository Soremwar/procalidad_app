import postgres from "../../services/postgres.js";

class Contacto {
  constructor(
    public readonly pk_contacto: number,
    public nombre: string,
    public correo: string,
    public telefono: string,
  ) {}

  async update(
    nombre: string = this.nombre,
    correo: string = this.correo,
    telefono: string = this.telefono,
  ): Promise<
    Contacto
  > {
    Object.assign(this, { nombre, correo, telefono });
    await postgres.query(
      "UPDATE CLIENTES.CONTACTO SET NOMBRE = $2, CORREO = $3, TELEFONO = $4 WHERE PK_CONTACTO = $1",
      this.pk_contacto,
      this.nombre,
      this.correo,
      this.telefono,
    );

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM CLIENTES.CONTACTO WHERE PK_CONTACTO = $1",
      this.pk_contacto,
    );
  }
}

export const findAll = async (): Promise<Contacto[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_CONTACTO, NOMBRE, CORREO, TELEFONO FROM CLIENTES.CONTACTO",
  );
  return rows.map((row: [number, string, string, string]) =>
    new Contacto(...row)
  );
};

export const findById = async (id: number): Promise<Contacto | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_CONTACTO, NOMBRE, CORREO, TELEFONO FROM CLIENTES.CONTACTO WHERE PK_CONTACTO = $1",
    id,
  );
  if (!rows[0]) return null;
  const result: [number, string, string, string] = rows[0];
  return new Contacto(...result);
};

export const createNew = async (
  nombre: string,
  correo: string,
  telefono: string,
): Promise<void> => {
  await postgres.query(
    "INSERT INTO CLIENTES.CONTACTO (NOMBRE, CORREO, TELEFONO) VALUES ($1, $2, $3)",
    nombre,
    correo,
    telefono,
  );
};
