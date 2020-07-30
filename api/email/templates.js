import {
  address,
  port,
} from "../../config/api_deno.js";
import HtmlEncoder from "html-entities";
import Handlebars from "handlebars";

//TODO
//Url should read the protocol config

Handlebars.registerHelper("AppUrl", function (app_route = "") {
  return new Handlebars.SafeString(
    `http://${address}:${port}/${app_route}`,
  );
});

Handlebars.registerHelper("AssetUrl", function (resource_route) {
  return new Handlebars.SafeString(
    `http://${address}:${port}/resources/${resource_route}`,
  );
});

export const createGenericEmail = async (content) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const html_content = html.encode(String(content));

  const raw_template = await Deno.readTextFile(
    new URL("./templates/generic.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template);

  return template({
    content: html_content,
  });
};

export const createAssignationRequestEmail = async (
  requestant,
  message,
  date,
  project,
  role,
  hours,
) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const safe_message = html.encode(String(message));

  const raw_template = await Deno.readTextFile(
    new URL("./templates/assignation_request.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template);

  return template({
    date,
    hours,
    message: safe_message,
    project,
    requestant,
    role,
  });
};
