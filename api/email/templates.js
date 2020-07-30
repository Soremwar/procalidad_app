import {
  address,
  port,
  protocol,
} from "../../config/app_deno.js";
import HtmlEncoder from "html-entities";
import Handlebars from "handlebars";

Handlebars.registerHelper("AppUrl", function (app_route = "") {
  return new Handlebars.SafeString(
    `${protocol}://${address}:${port}/${app_route}`,
  );
});

Handlebars.registerHelper("AssetUrl", function (resource_route) {
  return new Handlebars.SafeString(
    `${protocol}://${address}:${port}/resources/${resource_route}`,
  );
});

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

export const createAssignationRequestReviewEmail = async (
  approved,
  date,
  hours,
  message,
  project,
  requestant,
  role,
) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const safe_message = html.encode(String(message));

  const raw_template = await Deno.readTextFile(
    new URL("./templates/assignation_request_review.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template);

  return template({
    approved,
    date,
    hours,
    message: safe_message,
    project,
    requestant,
    role,
  });
};

export const createRegistryDelayedUserEmail = async (
  name,
  week_start,
  week_end,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/registry_delayed_user.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template);

  return template({
    name,
    week_start,
    week_end,
  });
};

export const createRegistryDelayedAreaEmail = async (
  people_data,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/registry_delayed_area.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template);

  return template({
    people_data,
  });
};
