import { helpers, Status } from "oak";
import Ajv from "ajv";
import * as budget_model from "../../../api/models/OPERACIONES/budget.ts";
import {
  findByBudget as findPlanningByBudget,
} from "../../../api/models/planeacion/recurso.ts";
import {
  findOpenByBudget as findOpenAssignationByBudget,
} from "../../../api/models/OPERACIONES/asignacion.ts";
import {
  findByBudget as findAsignationRequestByBudget,
} from "../../../api/models/OPERACIONES/asignacion_solicitud.ts";
import {
  createNew as createBudgetDetail,
  deleteByBudget as deleteBudgetDetail,
  findUseByBudget as findBudgetDetail,
} from "../../../api/models/OPERACIONES/budget_detail.ts";
import {
  findById as findProject,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import { Profiles } from "../../../api/common/profiles.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { BOOLEAN, INTEGER, NUMBER, STRING } from "../../../lib/ajv/types.js";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { RouterContext } from "../../state.ts";
import { BudgetDetail } from "../../../api/models/interfaces.ts";

const list_request = {
  $id: "list",
  properties: {
    "abierto": BOOLEAN,
    "proyecto": INTEGER({ min: 1 }),
  },
};

const update_request = {
  $id: "update",
  properties: {
    "budget_type": INTEGER({ min: 1 }),
    "description": STRING(255),
    "name": STRING(255),
    "project": NUMBER({ min: 1 }),
    "roles": {
      type: "object",
      properties: {
        "direct_cost": INTEGER({ min: 0 }),
        "hour_cost": NUMBER({ min: 0 }),
        "hours": NUMBER({ min: 0 }),
        "productivity_percentage": INTEGER({ min: 0 }),
        "role": INTEGER({ min: 1 }),
        "third_party_cost": NUMBER({ min: 0 }),
        "unforeseen_cost": NUMBER({ min: 0 }),
      },
      required: [
        "direct_cost",
        "hour_cost",
        "hours",
        "productivity_percentage",
        "role",
        "third_party_cost",
        "unforeseen_cost",
      ],
    },
    "status": BOOLEAN,
  },
};

const update_params = {
  $id: "update_params",
  properties: {
    "sobreescribir": BOOLEAN,
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

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    create_request,
    list_request,
    update_params,
    update_request,
  ],
});

export const createBudget = async (
  { request, response, state }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value: {
    budget_type: number;
    description: string;
    name: string;
    project: number;
    roles: BudgetDetail[];
    status: boolean;
  } = await request.body({ type: "json" }).value;
  if (request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const project_model = await findProject(value.project);
  if (!project_model) throw new Error("El proyecto seleccionado no existe");

  const allowed_editors = await project_model.getSupervisors();
  if (!allowed_editors.includes(state.user.id)) {
    if (
      !state.user.profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error("Su rol actual no le permite crear este presupuesto");
    }
  }

  const budget_id = await budget_model.createNew(
    value.project,
    value.budget_type,
    value.name,
    value.description,
    value.status,
  );

  for (const role of value.roles) {
    await createBudgetDetail({
      ...role,
      budget: budget_id,
    });
  }

  response.body = Message.OK;
};

export const deleteBudget = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let budget = await budget_model.findById(id);
  if (!budget) throw new NotFoundError();

  await deleteBudgetDetail(id);

  await budget.delete();

  response.body = Message.OK;
};

export const getBudget = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await budget_model.findById(id);
  if (!budget) throw new NotFoundError();

  const roles = await findBudgetDetail(id);

  response.body = { ...budget, roles };
};

export const getBudgets = async (context: RouterContext) => {
  const value: {
    abierto?: boolean;
    proyecto?: number;
  } = helpers.getQuery(context);
  if (!request_validator.validate(value, "list")) {
    throw new RequestSyntaxError();
  }

  context.response.body = await budget_model.findAll({
    open: value.abierto,
    project: value.proyecto,
  });
};

export const getBudgetTable = (context: RouterContext) =>
  tableRequestHandler(
    context,
    budget_model.getTableData,
  );

export const updateBudget = async (
  context: RouterContext<{ id: string }>,
) => {
  const query_params: {
    sobreescribir?: string;
  } = helpers.getQuery(context);
  if (!request_validator.validate(query_params, "update_params")) {
    throw new RequestSyntaxError();
  }

  const delete_open_items = !!query_params.sobreescribir &&
    castStringToBoolean(query_params.sobreescribir);

  const { params, request, response, state } = context;

  const id = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await budget_model.findById(id);
  if (!budget) throw new NotFoundError();
  if (!budget.estado) {
    throw new Error("No es posible editar un presupuesto cerrado");
  }

  const project = await findProject(budget.fk_proyecto);
  if (!project) throw new Error("El proyecto seleccionado no existe");

  const allowed_editors = await project.getSupervisors();
  if (!allowed_editors.includes(state.user.id)) {
    if (
      !state.user.profiles.some((profile: number) =>
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
    roles: BudgetDetail[];
    status: boolean;
  } = await request.body({ type: "json" }).value;
  if (request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  const open_assignation = await findOpenAssignationByBudget(
    budget.pk_presupuesto,
  );
  const open_assignation_request = await findAsignationRequestByBudget(
    budget.pk_presupuesto,
  );
  const open_planning = await findPlanningByBudget(budget.pk_presupuesto);

  const count = {
    assignation: open_assignation.length,
    assignation_request: open_assignation_request.length,
    planning: open_planning.length,
  };

  // Only open budgets can be edited
  // If their state is set to false, request user permissions to delete everything that depends on the budget
  if (value.status === false) {
    if (
      (count.assignation || count.assignation_request || count.planning) &&
      delete_open_items === false
    ) {
      response.status = Status.Accepted;
      response.body = {
        code: "BUDGET_IN_USE",
        message: count,
      };
      return;
    }

    for (const planning of open_planning) {
      await planning.delete();
    }

    for (const assignation_request of open_assignation_request) {
      await assignation_request.delete();
    }

    for (const assignation of open_assignation) {
      await assignation.delete();
    }
  }

  await budget.update(
    value.budget_type,
    value.name,
    value.description,
    value.status,
  );

  //Only add/edit roles, deletion is only allowed for non used roles
  const current_roles = await findBudgetDetail(id);
  const new_roles = value.roles.reduce(
    (current_roles, role) => {
      const current_role_index = current_roles.findIndex((current_role) =>
        current_role.budget === role.budget
      );

      //Update if found
      if (current_role_index !== -1) {
        Object.assign(current_roles[current_role_index], {
          ...role,
          budget: id,
        });
        //Insert otherwise
      } else {
        current_roles.push(role);
      }

      return current_roles;
    },
    //Roles that need to be keeped
    current_roles.filter(({ used }) => used),
  );

  await deleteBudgetDetail(id);

  for (const role of new_roles) {
    await createBudgetDetail({
      ...role,
      budget: id,
    });
  }

  response.body = budget;
};
