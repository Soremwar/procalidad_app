import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/registro_detalle.ts";
import {
  createNewControl,
  findLastOpenWeek,
} from "../../../api/models/ORGANIZACION/control_cierre_semana.ts";
import Ajv from "ajv";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../../lib/ajv/types.js";

const post_structure = {
  $id: "post",
  properties: {
    "control": {
      minimum: 1,
      pattern: "^[0-9]+$|^null$",
      type: ["string", "number", "null"],
    },
    "budget": TRUTHY_INTEGER,
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "control",
    "budget",
    "hours",
  ],
};

const put_structure = {
  $id: "put",
  properties: {
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "hours",
  ],
};

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    post_structure,
    put_structure,
  ],
});

export const getWeeksDetail = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getWeekDetail = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const detail = await findById(id);
  if (!detail) throw new NotFoundError();

  response.body = detail;
};

export const getOpenWeek = async ({ request, response }: RouterContext) => {
  const {
    person,
  }: {
    person?: string;
  } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  //I can pass both undefined or a number to the function
  if (person !== undefined && !Number(person)) throw new RequestSyntaxError();

  response.body = await findLastOpenWeek(person ? Number(person) : undefined);
};

export const getWeekDetailTable = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  response.body = await getTableData(id);
};

export const createWeekDetail = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person: number = Number(params.person);
  if (!person) throw new RequestSyntaxError();
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("post", value)
  ) {
    throw new RequestSyntaxError();
  }

  let control: number;
  if (String(value.control) === "null") {
    control = await createNewControl(
      person,
    ).then((week_control) => week_control.id);
  } else {
    control = Number(value.control);
  }

  response.body = await createNew(
    control,
    Number(value.budget),
    Number(value.hours),
  );
};

export const updateWeekDetail = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("put", value)
  ) {
    throw new RequestSyntaxError();
  }

  let detail = await findById(id);
  if (!detail) throw new NotFoundError();

  response.body = await detail.update(
    Number(value.hours),
  );
};
