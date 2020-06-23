import postgres from "../../services/postgres.js";
import { PostgresError } from "deno_postgres";
import {
  TableOrder,
} from "../../common/table.ts";

//TODO
//Replace table string
export const TABLE = "ORGANIZACION.AREA";

const ERROR_CONSTRAINT_DEFAULT =
  "Uno de los datos seleccionables ingresados para el area no existe";
const getConstraintError = (key: string) =>
  `El dato "${key}" ingresado para el area no existe`;
const ERROR_DEPENDENCY =
  "No se puede eliminar el area por que hay componentes que dependen de el";

class Area {
  constructor(
    public readonly pk_area: number,
    public fk_tipo_area: number,
    public nombre: string,
    public fk_supervisor: number,
  ) {}

  async update(
    fk_tipo_area: number = this.fk_tipo_area,
    nombre: string = this.nombre,
    fk_supervisor: number = this.fk_supervisor,
  ): Promise<
    Area
  > {
    Object.assign(this, { fk_tipo_area, nombre, fk_supervisor });
    await postgres.query(
      "UPDATE ORGANIZACION.AREA SET FK_TIPO_AREA = $2, NOMBRE = $3, FK_SUPERVISOR = $4 WHERE PK_AREA = $1",
      this.pk_area,
      this.fk_tipo_area,
      this.nombre,
      this.fk_supervisor,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        if (e.fields.detail) {
          if (/persona/.test(e.fields.constraint)) {
            e.message = getConstraintError("supervisor");
          } else if (/tipo_area/.test(e.fields.detail)) {
            e.message = getConstraintError("tipo de area");
          } else {
            e.message = ERROR_CONSTRAINT_DEFAULT;
          }
        } else {
          e.message = ERROR_CONSTRAINT_DEFAULT;
        }
      }

      throw e;
    });

    return this;
  }

  async delete(): Promise<void> {
    await postgres.query(
      "DELETE FROM ORGANIZACION.AREA WHERE PK_AREA = $1",
      this.pk_area,
    ).catch((e: PostgresError) => {
      if (e.fields.constraint) {
        e.message = ERROR_DEPENDENCY;
      }

      throw e;
    });
  }
}

export const findAll = async (): Promise<Area[]> => {
  const { rows } = await postgres.query(
    "SELECT PK_AREA, FK_TIPO_AREA, NOMBRE, FK_SUPERVISOR FROM ORGANIZACION.AREA",
  );

  const models = rows.map((row: [
    number,
    number,
    string,
    number,
  ]) => new Area(...row));

  return models;
};

export const findById = async (id: number): Promise<Area | null> => {
  const { rows } = await postgres.query(
    "SELECT PK_AREA, FK_TIPO_AREA, NOMBRE, FK_SUPERVISOR FROM ORGANIZACION.AREA WHERE PK_AREA = $1",
    id,
  );
  if (!rows[0]) return null;
  const result: [
    number,
    number,
    string,
    number,
  ] = rows[0];
  return new Area(...result);
};

export const createNew = async (
  fk_tipo_area: number,
  nombre: string,
  fk_supervisor: number,
) => {
  await postgres.query(
    "INSERT INTO ORGANIZACION.AREA (FK_TIPO_AREA, NOMBRE, FK_SUPERVISOR) VALUES ($1, $2, $3)",
    fk_tipo_area,
    nombre,
    fk_supervisor,
  );
};

class TableData {
  constructor(
    public id: number,
    public area_type: string,
    public name: string,
    public supervisor: string,
  ) {}
}

export const getTableData = async (
  order: TableOrder,
  page: number,
  rows: number | null,
  search: string,
): Promise<TableData[]> => {
  //TODO
  //Replace search string with search object passed from the frontend table definition

  //TODO
  //Normalize query generator

  const query =
    "SELECT * FROM (SELECT PK_AREA AS ID, (SELECT NOMBRE FROM ORGANIZACION.TIPO_AREA WHERE PK_TIPO = FK_TIPO_AREA) AS AREA_TYPE, NOMBRE AS NAME, (SELECT NOMBRE FROM ORGANIZACION.PERSONA WHERE PK_PERSONA = FK_SUPERVISOR) AS SUPERVISOR FROM ORGANIZACION.AREA) AS TOTAL" +
    " " +
    `WHERE UNACCENT(AREA_TYPE) ILIKE '%${search}%' OR UNACCENT(NAME) ILIKE '%${search}%' OR UNACCENT(SUPERVISOR) ILIKE '%${search}%'` +
    " " +
    (Object.values(order).length
      ? `ORDER BY ${Object.entries(order).map(([column, order]) =>
        `${column} ${order}`
      ).join(", ")}`
      : "") +
    " " +
    (rows ? `OFFSET ${rows * page} LIMIT ${rows}` : "");

  const { rows: result } = await postgres.query(query);

  const models = result.map((x: [
    number,
    string,
    string,
    string,
  ]) => new TableData(...x));

  return models;
};
