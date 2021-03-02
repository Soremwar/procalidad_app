import Ajv from "ajv";
import {
  create,
  findById,
  findByPerson,
  getCalculatedResult,
} from "../../../api/models/ORGANIZACION/internal_cost.ts";
import { InternalCostType } from "../../../api/models/enums.ts";
import { InternalCost } from "../../../api/models/interfaces.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  INTEGER,
  STANDARD_DATE_STRING,
  STRING,
} from "../../../lib/ajv/types.js";
import {
  multipleDateRangesAreContinuous,
  multipleDateRangesOverlap,
} from "../../../lib/date/util.ts";
import { RouterContext } from "../../state.ts";

const update_request = {
  $id: "update",
  properties: {
    "base_cost": INTEGER({ min: 0 }),
    "bonus_cost": INTEGER({ min: 0 }),
    "computer": INTEGER({ min: 1 }),
    "expiration_date": STANDARD_DATE_STRING,
    "licenses": {
      type: "array",
      items: INTEGER({ min: 1 }),
    },
    "other_costs": INTEGER({ min: 0 }),
    "person": INTEGER({ min: 1 }),
    "type": STRING(undefined, undefined, Object.values(InternalCostType)),
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "base_cost",
    "bonus_cost",
    "computer",
    "expiration_date",
    "licenses",
    "other_costs",
    "type",
  ],
});

const calculate_request = Object.assign({}, update_request, {
  $id: "calculate",
  required: [
    "base_cost",
    "bonus_cost",
    "computer",
    "licenses",
    "other_costs",
    "type",
  ],
});

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    calculate_request,
    create_request,
    update_request,
  ],
});

export const createCost = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value: InternalCost = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await create(value);
};

export const getCalculatedCost = async (
  { request, response }: RouterContext,
) => {
  const value: InternalCost = await request.body({ type: "json" }).value;
  if (!request_validator.validate("calculate", value)) {
    throw new RequestSyntaxError();
  }

  const result = await getCalculatedResult(value);

  if (!result) {
    throw new Error("El calculo de costo no se ejecuto correctamente");
  }

  response.body = result;
};

export const getCost = async (
  { params, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person) throw new RequestSyntaxError();

  const salary = await findByPerson(person);
  if (!salary) throw new NotFoundError();

  response.body = salary;
};

export const updateCost = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!request.hasBody || !person) throw new RequestSyntaxError();

  const value: {
    costs: InternalCost[];
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  // Test end date is greater than start date
  const date_range_is_valid = value.costs.every(({ start_date, end_date }) => {
    if (!end_date) return true;
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

  if (
    value.costs.length > 1 &&
    !multipleDateRangesAreContinuous(
      value.costs.map((
        { start_date, end_date },
        // Use the max possible date in case the end date was not specified
      ) => [new Date(start_date), new Date(end_date || 8640000000000000)]),
    )
  ) {
    throw new RequestSyntaxError(
      "Los rangos de los periodos deben ser continuos",
    );
  }

  // Delete any items that aren't included in the updated values
  const updated_items = value.costs.map(({ id }) => Number(id));
  for (const cost of await findByPerson(person)) {
    if (!updated_items.includes(Number(cost.id))) {
      await cost.delete();
    }
  }

  for (const cost of value.costs) {
    if (cost.id) {
      const previous_cost = await findById(cost.id);
      if (!previous_cost) {
        await create(cost);
        continue;
      }
      await previous_cost.update(cost);
    } else {
      await create({
        ...cost,
        person,
      });
    }
  }

  response.body = Message.OK;
};
