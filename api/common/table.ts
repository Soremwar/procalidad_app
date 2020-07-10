import { RouterContext, Body } from "oak";
import { RequestSyntaxError } from "../../web/exceptions.ts";
import postgres from "../services/postgres.js";
import { QueryResult } from "deno_postgres/query.ts";

export enum Order {
  "asc" = "asc",
  "desc" = "desc",
}

export interface TableOrder {
  [key: string]: Order;
}

export const parseOrderFromObject = (object: { [key: string]: string }) => {
  return Object.entries(object).reduce(
    (res: TableOrder, [index, value]: [string, string]) => {
      if (value in Order) {
        res[index] = value as Order;
      }
      return res;
    },
    {} as TableOrder,
  );
};

export const tableRequestHandler = async (
  { request, response }: RouterContext,
  fetchDataSource: (
    order: TableOrder,
    page: number,
    rows: number | null,
    search: { [key: string]: string },
  ) => Promise<TableResult>,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    order = {},
    page,
    rows,
    search = {},
  } = await request.body().then((x: Body) => x.value);

  if (
    !(
      order instanceof Object &&
      search instanceof Object
    )
  ) {
    throw new RequestSyntaxError();
  }

  const order_parameters = parseOrderFromObject(order);

  const data = await fetchDataSource(
    order_parameters,
    page || 0,
    rows || null,
    search,
  );

  response.body = data;
};

export const generateTableSql = (
  sql: string,
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
) => {
  return `SELECT * FROM (${sql}) AS TOTAL` +
    " " +
    (Object.keys(search).length
      ? `WHERE ${
        Object.entries(search)
          .map(([column, value]) => (
            `CAST(${column} AS VARCHAR) ILIKE '%${value}%'`
          )).join(" AND ")
      }`
      : "") +
    " " +
    (Object.values(order).length
      ? `ORDER BY ${
        Object.entries(order).map(([column, order]) => `${column} ${order}`)
          .join(", ")
      }`
      : "") +
    " " +
    (rows ? `OFFSET ${rows * page} LIMIT ${rows}` : "");
};

export const generateCountSql = (
  sql: string,
  search: { [key: string]: string },
) => (
  `SELECT COUNT(1) FROM (${sql}) AS TOTAL` +
  " " +
  (Object.keys(search).length
    ? `WHERE ${
      Object.entries(search)
        .map(([column, value]) => (
          `CAST(${column} AS VARCHAR) ILIKE '%${value}%'`
        )).join(" AND ")
    }`
    : "")
);

//TODO
//Change any for typed array
export const getTableModels = async (
  sql: string,
  order: TableOrder,
  page: number,
  rows: number | null,
  search: { [key: string]: string },
): Promise<{ count: number; data: any[] }> => {
  const data_query = generateTableSql(
    sql,
    order,
    page,
    rows,
    search,
  );

  const count_query = generateCountSql(
    sql,
    search,
  );

  const { rows: data }: QueryResult = await postgres.query(data_query);
  const count: number = await postgres.query(count_query).then((
    { rows }: QueryResult,
  ) => Number(rows[0][0]));

  return {
    count,
    data,
  };
};

export class TableResult {
  constructor(
    public readonly count: number,
    public readonly data: object[],
  ) {}
}
