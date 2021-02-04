import Ajv from "ajv";
import {
  create,
  findById,
  findByPerson,
} from "../../../api/models/ORGANIZACION/external_cost.ts";
import { ExternalCost } from "../../../api/models/interfaces.ts";
import { CostType } from "../../../api/models/enums.ts";
import { Message } from "../../http_utils.ts";
import { RequestSyntaxError } from "../../exceptions.ts";
import {
  INTEGER,
  INTEGER_OR_NULL,
  STANDARD_DATE_STRING,
  STRING,
} from "../../../lib/ajv/types.js";
import { multipleDateRangesOverlap } from "../../../lib/date/util.ts";
import { RouterContext } from "../../state.ts";

const update_request = {
  $id: "update",
  properties: {
    "costs": {
      type: "array",
      items: {
        properties: {
          "computer": INTEGER_OR_NULL({ min: 1 }),
          "cost": INTEGER({ min: 1 }),
          "end_date": STANDARD_DATE_STRING,
          "id": INTEGER({ min: 1 }),
          "licenses": {
            type: "array",
            items: INTEGER({ min: 1 }),
          },
          "other_costs": INTEGER({ min: 0 }),
          "person": INTEGER({ min: 1 }),
          "start_date": STANDARD_DATE_STRING,
          "type": STRING(
            undefined,
            undefined,
            Object.values(CostType),
          ),
        },
        required: [
          "computer",
          "cost",
          "end_date",
          "licenses",
          "other_costs",
          "start_date",
          "type",
        ],
      },
    },
  },
};

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    update_request,
  ],
});

export const getCosts = async (
  { params, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person) throw new RequestSyntaxError();

  response.body = await findByPerson(person);
};

export const updateCosts = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person) {
    throw new RequestSyntaxError();
  }

  const value: {
    costs: ExternalCost[];
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  // Test end date is greater than start date
  const date_range_is_valid = value.costs.every(({ start_date, end_date }) => {
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
      ) => [new Date(start_date), new Date(end_date)]),
    )
  ) {
    throw new RequestSyntaxError(
      "Los rangos de los periodos no pueden entrecuzarse",
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
