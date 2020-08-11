import { RouterContext } from "oak";
import {
  findAll,
  findById,
} from "../../../api/models/MAESTRO/marital_status.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getMaritalStatuses = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getMaritalStatus = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const marital_status = await findById(id);
  if (!marital_status) throw new NotFoundError();

  response.body = marital_status;
};
