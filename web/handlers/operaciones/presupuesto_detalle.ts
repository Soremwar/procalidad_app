import type { RouterContext } from "oak";
import {
  findByBudget,
} from "../../../api/models/OPERACIONES/PRESUPUESTO_DETALLE.ts";
import { RequestSyntaxError } from "../../exceptions.ts";

export const searchBudgetDetails = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const budget_id: number = Number(params.id);
  if (!budget_id) throw new RequestSyntaxError();

  const details = await findByBudget(budget_id);

  response.body = details;
};
