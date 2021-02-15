import Ajv from "ajv";
import * as computer_model from "../../../api/models/ORGANIZACION/computer.ts";
import * as computer_cost_model from "../../../api/models/ORGANIZACION/computer_cost.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { RouterContext } from "../../state.ts";
import {
  INTEGER,
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  STRING,
} from "../../../lib/ajv/types.js";
import { ComputerData } from "../../../api/models/interfaces.ts";
import { multipleDateRangesOverlap } from "../../../lib/date/util.ts";

const costs = {
  properties: {
    "cost": INTEGER({ min: 1 }),
    "end_date": STANDARD_DATE_STRING_OR_NULL,
    "id": INTEGER({ min: 1 }),
    "start_date": STANDARD_DATE_STRING,
  },
  required: [
    "cost",
    "end_date",
    "start_date",
  ],
};

const update_request = {
  $id: "update",
  properties: {
    "costs": {
      type: "array",
      items: costs,
    },
    "description": STRING(255),
    "name": STRING(100),
  },
  required: [
    "costs",
  ],
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "description",
    "name",
  ],
});

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    create_request,
    update_request,
  ],
});

export const createComputer = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value: ComputerData = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await computer_model.create(value);
};

export const getComputer = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const computer = await computer_model.findById(id);
  if (!computer) throw new NotFoundError();

  const computer_cost = await computer_cost_model.findByComputer(id);

  response.body = {
    ...computer,
    costs: computer_cost,
  } as ComputerData;
};

export const getComputers = async ({ response }: RouterContext) => {
  response.body = await computer_model.getAll();
};

export const getComputersTable = (context: RouterContext) =>
  tableRequestHandler(
    context,
    computer_model.getTableData,
  );

export const updateComputer = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const computer = await computer_model.findById(id);
  if (!computer) throw new NotFoundError();

  const value: ComputerData = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  // Test end date is greater than start date
  const date_range_is_valid = value.costs.every(({ start_date, end_date }) => {
    if (!end_date) {
      return true;
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    // If dates match it is the same day, so valid
    if (start.getTime() === end.getTime()) {
      return true;
    }

    return end > start;
  });

  if (!date_range_is_valid) {
    throw new RequestSyntaxError(
      "La fecha de inicio de cada periodo debe ser menor a su fecha final",
    );
  }

  if (
    value.costs.length > 1 &&
    multipleDateRangesOverlap(
      value.costs.map((
        { start_date, end_date },
        // Use the max possible date in case the end date was not specified
      ) => [new Date(start_date), new Date(end_date || 8640000000000000)]),
    )
  ) {
    throw new RequestSyntaxError(
      "Los rangos de los periodos no pueden entrecuzarse",
    );
  }

  await computer.update(value);

  // Delete any items that aren't included in the updated values
  const updated_items = value.costs.map(({ id }) => Number(id));
  for (const cost of await computer_cost_model.findByComputer(id)) {
    if (!updated_items.includes(Number(cost.id))) {
      await cost.delete();
    }
  }

  for (const cost of value.costs) {
    if (cost.id) {
      const previous_cost = await computer_cost_model.findById(cost.id);
      if (!previous_cost) {
        await computer_cost_model.create(cost);
        continue;
      }
      await previous_cost.update(cost);
    } else {
      await computer_cost_model.create({
        ...cost,
        computer: id,
      });
    }
  }

  response.body = Message.OK;
};

export const deleteComputer = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const computer = await computer_model.findById(id);
  if (!computer) throw new NotFoundError();

  for (const cost of await computer_cost_model.findByComputer(id)) {
    await cost.delete();
  }

  await computer.delete();

  response.body = Message.OK;
};
