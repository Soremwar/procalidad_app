import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  searchByName,
} from "../../../api/models/MAESTRO/PAIS.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getCountries = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getCountry = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const project_type = await findById(id);
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
