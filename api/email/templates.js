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
  const raw_template = await Deno.readTextFile(
    new URL("./templates/assignation_request.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    date: html.encode(date),
    hours,
    message: html.encode(message),
    project: html.encode(project),
    requestant: html.encode(requestant),
    role: html.encode(requestant),
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
  const raw_template = await Deno.readTextFile(
    new URL("./templates/assignation_request_review.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    approved,
    date: html.encode(date),
    hours,
    message: html.encode(message),
    project: html.encode(project),
    requestant: html.encode(requestant),
    role: html.encode(role),
  });
};

export const createRegistryDelayedUserEmail = async (
  name,
  week_start,
  week_end,
) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const raw_template = await Deno.readTextFile(
    new URL("./templates/registry_delayed_user.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    name: html.encode(name),
    week_start: html.encode(week_start),
    week_end: html.encode(week_end),
  });
};

export const createRegistryDelayedSubAreaEmail = async (
  people_data,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/registry_delayed_sub_area.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    people_data,
  });
};
