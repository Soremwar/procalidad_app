import type { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
} from "../../../api/models/MAESTRO/profile.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getProfiles = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const createProfile = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
  } = await request.body({ type: "json" }).value;

  if (!(name && description)) {
    throw new RequestSyntaxError();
  }

  response.body = await createNew(
    name,
    description,
  );
};

export const getProfile = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  response.body = licencia;
};

export const updateProfile = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  const {
    name,
    description,
  } = await request.body({ type: "json" }).value;

  response.body = await licencia.update(
    name,
    description,
  );
};

export const deleteProfile = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  await licencia.delete();

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
