import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  searchByName,
  searchByNameAndCountry,
} from "../../../api/models/MAESTRO/ESTADO.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getStates = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getState = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const state = await findById(id);
  if (!state) throw new NotFoundError();

  response.body = state;
};

export const searchState = async ({ response, request }: RouterContext) => {
  const {
    country: param_country,
    query: param_query,
    limit: param_limit,
  }: { [x: string]: string } = Object.fromEntries(
    request.searchParams.entries(),
  );

  const country: number = Number(param_country);
  const query: string = param_query;
  const limit: number = Number(param_limit) || 0;

  if (country) {
    response.body = await searchByNameAndCountry(country, query, limit);
  } else {
    response.body = await searchByName(query, limit);
  }
};
