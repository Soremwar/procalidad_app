import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  createNew as createBudgetItem,
  findAll as findBudgetItems,
  findById as findBudgetItem,
  getTableData as getBudgetItemTable,
} from "../../../api/models/OPERACIONES/budget.ts";
import {
  createNew as createBudgetDetail,
  deleteByBudget as deleteBudgetDetail,
  findByBudget as findBudgetDetail,
} from "../../../api/models/OPERACIONES/PRESUPUESTO_DETALLE.ts";
import {
  findById as findProject,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import { Profiles } from "../../../api/common/profiles.ts";
import { decodeToken } from "../../../lib/jwt.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { BOOLEAN, NUMBER, STRING } from "../../../lib/ajv/types.js";

interface Role {
  id: number;
  price: number;
  time: number;
}

const update_request = {
  $id: "update",
  properties: {
    "budget_type": NUMBER(1),
    "description": STRING(255),
    "name": STRING(255),
    "project": NUMBER(1),
    "roles": {
      type: "object",
      properties: {
        "id": NUMBER(1),
        "price": NUMBER(0),
        "time": NUMBER(0),
      },
      required: [
        "id",
        "price",
        "time",
      ],
    },
    "status": BOOLEAN,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "budget_type",
    "description",
    "name",
    "project",
    "roles",
    "status",
  ],
});

//@ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const getBudgets = async ({ response }: RouterContext) => {
  response.body = await findBudgetItems();
};

export const getBudgetTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getBudgetItemTable,
  );

export const createBudget = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

  const value: {
    budget_type: number;
    description: string;
    name: string;
    project: number;
    roles: Role[];
    status: boolean;
  } = await request.body({ type: "json" }).value;

  const project_model = await findProject(value.project);
  if (!project_model) throw new Error("El proyecto seleccionado no existe");

  const allowed_editors = await project_model.getSupervisors();
  if (!allowed_editors.includes(user_id)) {
    if (
      !user_profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error("Su rol actual no le permite crear este presupuesto");
    }
  }

  const budget_id = await createBudgetItem(
    value.project,
    value.budget_type,
    value.name,
    value.description,
    value.status,
  );

  for (const role of value.roles) {
    await createBudgetDetail(
      budget_id,
      role.id,
      role.time,
      role.price,
    );
  }

  response.body = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getBudget = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  const detail = await findBudgetDetail(id);

  response.body = { ...budget, roles: detail };
};

export const updateBudget = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();
  if (!budget.estado) {
    throw new Error("No es posible editar un presupuesto cerrado");
  }

  const project = await findProject(budget.fk_proyecto);
  if (!project) throw new Error("El proyecto seleccionado no existe");

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

  const allowed_editors = await project.getSupervisors();
  if (!allowed_editors.includes(user_id)) {
    if (
      !user_profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error("Su rol actual no le permite editar este presupuesto");
    }
  }

  const value: {
    budget_type: number;
    description: string;
    name: string;
    roles: Role[];
    status: boolean;
  } = await request.body({ type: "json" }).value;

  budget = await budget.update(
    value.budget_type,
    value.name,
    value.description,
    value.status,
  );

  await deleteBudgetDetail(id);

  for (const role of value.roles) {
    await createBudgetDetail(
      id,
      role.id,
      role.time,
      role.price,
    );
  }

  response.body = budget;
};

export const deleteBudget = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  await deleteBudgetDetail(id);

  await budget.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
