import type { RouterContext } from "oak";
import {
  getFile as getTemplateFileContent,
} from "../../api/storage/template_file.ts";
import {
  getFile as getGenericFileContent,
} from "../../api/storage/generic_file.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import { decodeToken } from "../../lib/jwt.ts";
import { Profiles } from "../../api/common/profiles.ts";

export const getGenericFile = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const session_cookie = cookies.get("PA_AUTH") || "";
  const user = await decodeToken(session_cookie);

  let file_request;
  if (
    [Profiles.ADMINISTRATOR, Profiles.CONTROLLER, Profiles.HUMAN_RESOURCES]
      .some((profile) => user.profiles.includes(profile))
  ) {
    file_request = getGenericFileContent(
      id,
    );
  } else {
    file_request = getGenericFileContent(
      id,
      user.id,
    );
  }

  const file = await file_request
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
  { cookies, params, response }: RouterContext<{ person: string; id: string }>,
) => {
  let person: number | undefined;
  if (params.person) {
    person = Number(params.person);
    if (!person) {
      throw new RequestSyntaxError();
    }
  }

  if (!person) {
    const session_cookie = cookies.get("PA_AUTH") || "";
    person = (await decodeToken(session_cookie)).id;
  }

  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const file = await getTemplateFileContent(
    id,
    person,
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
