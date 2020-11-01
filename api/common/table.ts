import type { RouterContext } from "oak";
import { RequestSyntaxError } from "../../web/exceptions.ts";
import postgres from "../services/postgres.js";
import type { QueryResult } from "deno_postgres/query.ts";

type SearchParameter = [boolean, [string, string]];

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
  { request, response }: RouterContext<any>,
  fetchDataSource: (
    order: TableOrder,
    page: number,
    rows: number | null,
    filters: { [key: string]: string },
    search: { [key: string]: string },
  ) => Promise<TableResult>,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    filters = {},
    order = {},
    page,
    rows,
    search = {},
  } = await request.body({ type: "json" }).value;

  if (
    !(
      filters instanceof Object &&
      order instanceof Object &&
      search instanceof Object
    )
  ) {
    throw new RequestSyntaxError();
  }

  const order_parameters = parseOrderFromObject(order);

  response.body = await fetchDataSource(
    order_parameters,
    page || 0,
    rows || null,
    filters,
    search,
  );
};

export const generateTableSql = (
  sql: string,
  order: TableOrder,
  page: number,
  rows: number | null,
  filters: { [key: string]: string },
  search: { [key: string]: string },
) => {
  const search_params: SearchParameter[] = Object.entries(search).reduce(
    (arr, [key, value]: [string, any]) => {
      arr.push([false, [key, String(value)]] as SearchParameter);
      return arr;
    },
    Object.keys(filters).length
      ? Object.entries(filters).map(([key, value]: [string, any]) =>
        [true, [key, String(value)]] as SearchParameter
      )
      : [],
  );

  return `SELECT * FROM (${sql}) AS TOTAL` +
    " " +
    (search_params.length
      ? `WHERE ${
        search_params
          .map(([exact_match, [column, value]]) => (
            `${column}::VARCHAR ${
              exact_match ? `= '${value}'` : `ILIKE '%${value}%'`
            }`
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
  filters: { [key: string]: string },
  search: { [key: string]: string },
) => {
  const search_params: SearchParameter[] = Object.entries(search).reduce(
    (arr, [key, value]: [string, any]) => {
      arr.push([false, [key, String(value)]] as SearchParameter);
      return arr;
    },
    Object.keys(filters).length
      ? Object.entries(filters).map(([key, value]: [string, any]) =>
        [true, [key, String(value)]] as SearchParameter
      )
      : [],
  );

  return (
    `SELECT COUNT(1) FROM (${sql}) AS TOTAL` +
    " " +
    (search_params.length
      ? `WHERE ${
        search_params
          .map(([exact_match, [column, value]]) => (
            `${column}::VARCHAR ${
              exact_match ? `= '${value}'` : `ILIKE '%${value}%'`
            }`
          )).join(" AND ")
      }`
      : "")
  );
};

//TODO
//Change any for typed array
export const getTableModels = async (
  sql: string,
  order: TableOrder,
  page: number,
  rows: number | null,
  filters: { [key: string]: string },
  search: { [key: string]: string },
): Promise<{ count: number; data: any[] }> => {
  const data_query = generateTableSql(
    sql,
    order,
    page,
    rows,
    filters,
    search,
  );

  const count_query = generateCountSql(
    sql,
    filters,
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
