import postgres from "../../services/postgres.ts";

export const TABLE = "ARCHIVOS.ARCHIVO_GENERICO";

export class GenericFile {
  constructor(
    public readonly id: number,
    public readonly user: number,
    public readonly path: string,
    public readonly max_size: number,
    public readonly extensions: string[],
    public readonly file_name: string,
    public upload_date: Date | null,
  ) {}

  async delete() {
    await postgres.query(
      `DELETE FROM ${TABLE}
      WHERE PK_ARCHIVO = $1`,
      this.id,
    );
  }

  async update(
    file_name = this.file_name,
  ) {
    const { rows } = await postgres.query(
      `UPDATE ${TABLE} SET
        NOMBRE_ARCHIVO = $2,
        FEC_CARGA = NOW()
      WHERE PK_ARCHIVO = $1
      RETURNING FEC_CARGA`,
      this.id,
      file_name,
    );

    this.upload_date = rows[0][0];

    return this;
  }
}

export const create = async (
  user: number,
  path: string,
  max_size: number,
  extensions: string[],
  file_name: string,
): Promise<GenericFile> => {
  const { rows } = await postgres.query(
    `INSERT INTO ${TABLE} (
      FK_USUARIO,
      RUTA,
      MAX_TAMANO,
      EXTENSIONES,
      NOMBRE_ARCHIVO
    ) VALUES (
      $1,
      $2,
      $3,
      '{${extensions.join(",")}}',
      $4
    ) RETURNING PK_ARCHIVO`,
    user,
    path,
    max_size,
    file_name,
  );

  const id: number = rows[0][0];

  return new GenericFile(
    id,
    user,
    path,
    max_size,
    extensions,
    file_name,
    null,
  );
};

/*
* Always provide user when accesing from API to avoid data leaks
* */
export const findByIdAndUser = async (
  id: number,
  user?: number,
): Promise<GenericFile | null> => {
  const { rows } = await postgres.query(
    `SELECT
      PK_ARCHIVO,
      FK_USUARIO,
      RUTA,
      MAX_TAMANO,
      EXTENSIONES,
      NOMBRE_ARCHIVO,
      FEC_CARGA
    FROM ${TABLE}
    WHERE PK_ARCHIVO = $1
    ${user ? `AND FK_USUARIO = ${user}` : ""}`,
    id,
  );

  if (!rows.length) return null;

  return new GenericFile(
    ...rows[0] as [
      number,
      number,
      string,
      number,
      string[],
      string,
      Date | null,
    ],
  );
};
