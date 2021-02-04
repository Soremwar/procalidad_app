import { queryObject } from "../../services/postgres.ts";
import { getTableModels, TableOrder, TableResult } from "../../common/table.ts";
import { Computer as ComputerInterface } from "../interfaces.ts";

export const TABLE = "ORGANIZACION.COMPUTADOR";

const fields = [
  "id",
  "name",
  "description",
];

class Computer implements ComputerInterface {
  public description: string;
  public id: number;
  public name: string;

  constructor(computer: ComputerInterface) {
    this.description = computer.description;
    this.id = computer.id;
    this.name = computer.name;
  }

  async update({
    description = this.description,
    name = this.name,
  }: ComputerInterface): Promise<
    Computer
  > {
    Object.assign(this, { description, name });

    await queryObject({
      text: (
        `UPDATE ${TABLE} SET
          NOMBRE = $2,
          DESCRIPCION = $3
        WHERE PK_COMPUTADOR = $1`
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
      text: `DELETE FROM ${TABLE} WHERE PK_COMPUTADOR = $1`,
      args: [this.id],
    });
  }
}

export const create = async ({
  name,
  description,
}: ComputerInterface): Promise<Computer> => {
  const { rows } = await queryObject<{ id: number }>({
    text: (
      `INSERT INTO ${TABLE} (
        NOMBRE,
        DESCRIPCION
      ) VALUES (
        $1,
        $2
      ) RETURNING
        PK_COMPUTADOR`
    ),
    args: [
      name,
      description,
    ],
    fields: ["id"],
  });

  return new Computer({
    description,
    id: rows[0].id,
    name,
  });
};

export const findById = async (id: number): Promise<Computer | null> => {
  const { rows } = await queryObject<ComputerInterface>({
    text: (
      `SELECT
        PK_COMPUTADOR,
        NOMBRE,
        DESCRIPCION
      FROM ${TABLE}
      WHERE PK_COMPUTADOR = $1`
    ),
    args: [id],
    fields,
  });

  if (!rows.length) return null;

  return new Computer(rows[0]);
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
      PK_COMPUTADOR AS ID,
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
