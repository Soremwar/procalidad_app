import { RouterContext, Body } from "oak";
import {
  getNonLaboralDaysBetween,
} from "../../../api/models/MAESTRO/dim_tiempo.ts";
import {
  parseStandardNumber,
} from "../../../lib/date/mod.js";
import {
  RequestSyntaxError,
} from "../../exceptions.ts";

export const getBlacklistedDays = async ({ response, request }: RouterContext) => {
  const {
    start_date,
    end_date,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  if(!(
    parseStandardNumber(Number(start_date)) &&
    parseStandardNumber(Number(end_date))
  )) throw new RequestSyntaxError();

  response.body = await getNonLaboralDaysBetween(
    Number(start_date),
    Number(end_date),
  );
};
