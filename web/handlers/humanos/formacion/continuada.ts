import type { RouterContext } from "oak";
import { FormationType } from "../../../../api/models/users/formation_level.ts";
import * as formation_title_model from "../../../../api/models/users/formation_title.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
export { getTitle, updateTitleReview } from "./formacion.ts";

export const getTitlesTable = async (
  context: RouterContext,
) =>
  tableRequestHandler(
    context,
    formation_title_model.generateTableData(
      FormationType.Continuada,
    ),
  );
