import type { RouterContext } from "oak";
import { findAll } from "../../../api/models/MAESTRO/gender.ts";

export const getGenders = async ({ response }: RouterContext) => {
  response.body = await findAll();
};
