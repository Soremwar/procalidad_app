import { RouterContext } from "oak";
import {
  findAll,
} from "../../../api/models/ORGANIZACION/PERSONA.ts";

export const getPeople = async ({ response }: RouterContext) => {
  response.body = await findAll();
};
