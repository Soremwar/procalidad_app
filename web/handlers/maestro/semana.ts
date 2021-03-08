import * as model from "../../../api/models/MAESTRO/dim_semana.ts";
import { RouterContext } from "../../state.ts";

export const getCurrentWeek = async ({ response }: RouterContext) => {
  response.body = await model.getCurrentWeek();
};
