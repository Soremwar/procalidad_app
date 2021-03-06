import type { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/CLIENTES/SECTOR.ts";
import { Order, TableOrder } from "../../../api/common/table.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getSectors = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getSectorsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createSector = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
  } = await request.body({ type: "json" }).value;

  if (!name) throw new RequestSyntaxError();

  await createNew(
    name,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getSector = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const sector = await findById(id);
  if (!sector) throw new NotFoundError();

  response.body = sector;
};

export const updateSector = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let sector = await findById(id);
  if (!sector) throw new NotFoundError();

  const {
    name,
  } = await request.body({ type: "json" }).value;

  sector = await sector.update(
    name,
  );

  response.body = sector;
};

export const deleteSector = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let contact = await findById(id);
  if (!contact) throw new NotFoundError();

  await contact.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
