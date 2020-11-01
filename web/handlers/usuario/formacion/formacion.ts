import type { RouterContext } from "oak";
import * as formation_title_model from "../../../../api/models/users/formation_title.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";
import {
  deleteReview,
  requestReview,
} from "../../../../api/reviews/user_formation.ts";
import { decodeToken } from "../../../../lib/jwt.ts";
import {
  deleteFile as deleteGenericFile,
} from "../../../../api/storage/generic_file.ts";

export const deleteTitle = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!formation_title) {
    throw new NotFoundError();
  }

  try {
    await deleteReview(String(formation_title.id));
    const generic_file_id = formation_title.generic_file;

    //Formation title should be deleted first so file constraint doesn't complain
    await formation_title.delete();
    if (generic_file_id) {
      await deleteGenericFile(generic_file_id);
    }
  } catch (_e) {
    throw new Error("No fue posible eliminar el título de formación");
  }

  response.body = Message.OK;
};

export const getTitle = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!formation_title) throw new NotFoundError();

  response.body = formation_title;
};
