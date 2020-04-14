import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  searchByName,
  searchByNameAndState,
} from "../../../api/models/MAESTRO/CIUDAD.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getCities = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getCity = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const state = await findById(id);
  if (!state) throw new NotFoundError();

  response.body = state;
};

export const searchCity = async ({ response, request }: RouterContext) => {
  const {
    state: param_state,
    query: param_query,
    limit: param_limit,
  }: { [x: string]: string } = Object.fromEntries(
    request.searchParams.entries(),
  );

  const state: number = Number(param_state);
  const query: string = param_query;
  const limit: number = Number(param_limit) || 0;

  if (state) {
    response.body = await searchByNameAndState(state, query, limit);
  } else {
    response.body = await searchByName(query, limit);
  }
};
