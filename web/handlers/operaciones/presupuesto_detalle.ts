import { findByBudget } from "../../../api/models/OPERACIONES/budget_detail.ts";
import { RequestSyntaxError } from "../../exceptions.ts";
import { RouterContext } from "../../state.ts";

export const searchBudgetDetails = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const budget_id = Number(params.id);
  if (!budget_id) throw new RequestSyntaxError();

  const details = await findByBudget(budget_id);

  response.body = details;
};
