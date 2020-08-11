import { RouterContext } from "oak";
import {
  findAll,
} from "../../../api/models/MAESTRO/language.ts";

export const getLanguages = async ({ response }: RouterContext) => {
  response.body = await findAll();
};
