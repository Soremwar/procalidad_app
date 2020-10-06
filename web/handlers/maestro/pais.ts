import type { RouterContext } from "oak";
import {
  findAll,
  findById,
  findByName,
  searchByName,
} from "../../../api/models/MAESTRO/PAIS.ts";
import type { Pais } from "../../../api/models/MAESTRO/PAIS.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getCountries = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

/**
 * It receives either a name or an id
 * and looks up for the country based on the parameter type
 * 
 * String -> name
 * 
 * Number -> Id
 */
export const getCountry = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  let id: number | string;

  if (Number(params.id)) {
    id = Number(params.id);
  } else if (params.id) {
    id = params.id;
  } else {
    throw new RequestSyntaxError();
  }

  let project_type: Pais | null;
  if (typeof id === "string") {
    project_type = await findByName(id);
  } else {
    project_type = await findById(id);
  }

  if (!project_type) throw new NotFoundError();

  response.body = project_type;
};

export const searchCountry = async ({ response, request }: RouterContext) => {
  const {
    query: param_query,
    limit: param_limit,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  const query: string = param_query;
  const limit: number = Number(param_limit) || 0;

  const countries = await searchByName(query, limit);

  response.body = countries;
};
