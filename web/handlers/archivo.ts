import type { RouterContext } from "oak";
import {
  getFile as getTemplateFileContent,
} from "../../api/storage/template_file.ts";
import {
  getFile as getGenericFileContent,
} from "../../api/storage/generic_file.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import { decodeToken } from "../../lib/jwt.ts";

export const getGenericFile = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  const file = await getGenericFileContent(
    id,
    user_id,
  )
    .catch((e) => {
      if (e.name === "NotFound" || e instanceof NotFoundError) {
        //404
        throw new NotFoundError();
      } else {
        //500
        throw new Error();
      }
    });

  response.headers.append("Content-Type", file.type);
  response.headers.append(
    "Content-disposition",
    `attachment;filename=${file.name}`,
  );
  response.headers.append("Content-Length", String(file.content.length));

  response.body = file.content;
};

export const getTemplateFile = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  const file = await getTemplateFileContent(
    id,
    user_id,
  )
    .catch((e) => {
      if (e.name === "NotFound" || e instanceof NotFoundError) {
        //404
        throw new NotFoundError();
      } else {
        //500
        throw new Error();
      }
    });

  response.headers.append("Content-Type", file.type);
  response.headers.append(
    "Content-disposition",
    `attachment;filename=${file.name}`,
  );
  response.headers.append("Content-Length", String(file.content.length));

  response.body = file.content;
};
