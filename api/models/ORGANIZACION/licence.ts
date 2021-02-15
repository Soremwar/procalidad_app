import { queryObject } from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { Licence as LicenceInterface } from "../interfaces.ts";

export const TABLE = "ORGANIZACION.LICENCIA";

const fields = [
  "id",
  "name",
  "description",
];

class Licence implements LicenceInterface {
  public description: string;
  public id: number;
  public name: string;

  constructor(licence: LicenceInterface) {
    this.description = licence.description;
    this.id = licence.id;
    this.name = licence.name;
  }

  async update({
    description = this.description,
    name = this.name,
  }: LicenceInterface): Promise<
    Licence
  > {
    Object.assign(this, { description, name });

    await queryObject({
      text: (
        `UPDATE ${TABLE} SET
          NOMBRE = $2,
          DESCRIPCION = $3
        WHERE PK_LICENCIA = $1`
      ),
      args: [
        this.id,
        this.name,
        this.description,
      ],
    });

    return this;
  }

  async delete(): Promise<void> {
    await queryObject({
      text: `DELETE FROM ${TABLE} WHERE PK_LICENCIA = $1`,
      args: [this.id],
    });
  }
}

export const create = async ({
  name,
  description,
}: LicenceInterface): Promise<Licence> => {
  const { rows } = await queryObject<{ id: number }>({
    text: (
      `INSERT INTO ${TABLE} (
        NOMBRE,
        DESCRIPCION
      ) VALUES (
        $1,
        $2
      ) RETURNING
        PK_LICENCIA`
    ),
    args: [
      name,
      description,
    ],
    fields: ["id"],
  });

  return new Licence({
    description,
    id: rows[0].id,
    name,
  });
};

export const getAll = async (): Promise<Licence[]> => {
  const { rows } = await queryObject<LicenceInterface>({
    text: (
      `SELECT
        PK_LICENCIA,
        NOMBRE,
        DESCRIPCION
      FROM ${TABLE}`
    ),
    fields,
  });

  return rows.map((row) => new Licence(row));
};

export const findById = async (id: number): Promise<Licence | null> => {
  const { rows } = await queryObject<LicenceInterface>({
    text: (
      `SELECT
        PK_LICENCIA,
        NOMBRE,
        DESCRIPCION
      FROM ${TABLE}
      WHERE PK_LICENCIA = $1`
    ),
    args: [id],
    fields,
  });

  if (!rows.length) return null;

  return new Licence(rows[0]);
};

class TableData {
  constructor(
    public id: number,
    public name: string,
    public description: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<TableResult> => {
  const base_query = (
    `SELECT
      PK_LICENCIA AS ID,
      NOMBRE AS NAME,
      DESCRIPCION AS DESCRIPTION
    FROM ${TABLE}`
  );

  const { count, data } = await getTableModels(
    base_query,
    order,
    page,
    rows,
    filters,
    search,
  );

  const models = data.map((x: [
    number,
    string,
    string,
  ]) => new TableData(...x));

  return new TableResult(
    count,
    models,
  );
};
