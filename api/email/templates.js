import { address, port, protocol } from "../../config/app_deno.js";
import HtmlEncoder from "html-entities";
import Handlebars from "handlebars";

const getAppRoute = (route) => `${protocol}://${address}:${port}/${route}`;

Handlebars.registerHelper("AppUrl", function (app_route = "") {
  return new Handlebars.SafeString(getAppRoute(app_route));
});

Handlebars.registerHelper("AssetUrl", function (resource_route) {
  return new Handlebars.SafeString(
    getAppRoute(`resources/${resource_route}`),
  );
});

Handlebars.registerHelper("Link", function (title, route) {
  return new Handlebars.SafeString(
    `<li><a href="${getAppRoute(route)}">${title}</a></li>`,
  );
});

const layout = await Deno.readTextFile(
  new URL("./templates/layout.html", import.meta.url),
);
Handlebars.registerPartial("layout", layout);

export const createAssignationRequestEmail = async (
  client,
  date,
  hours,
  message,
  project,
  requestant,
  role,
  supervisor,
) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const raw_template = await Deno.readTextFile(
    new URL("./templates/assignation_request.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    client: html.encode(client),
    date: html.encode(date),
    hours,
    message: html.encode(message),
    project: html.encode(project),
    requestant: html.encode(requestant),
    role: html.encode(role),
    supervisor: html.encode(supervisor),
  });
};

export const createAssignationRequestReviewEmail = async (
  approved,
  date,
  hours,
  message,
  client,
  project,
  reason,
  requestant,
  role,
  supervisor,
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
    client: html.encode(client),
    date: html.encode(date),
    hours,
    message: html.encode(message),
    project: html.encode(project),
    reason: html.encode(reason),
    requestant: html.encode(requestant),
    role: html.encode(role),
    supervisor: html.encode(supervisor),
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

export const createHumanResourcesReviewRequestEmail = async (
  requestant,
  formulary,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/human_resources_review_request.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    formulary,
    requestant,
  });
};

export const createHumanResourcesReviewEmail = async (
  reviewer,
  approved,
  comments,
  formulary,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/human_resources_review.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    approved,
    comments,
    formulary,
    reviewer,
  });
};

export const createEarlyCloseRequestEmail = async (
  requestant,
  current_hours,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/early_close_request.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    current_hours,
    requestant,
  });
};

export const createEarlyCloseRequestReviewEmail = async (
  reviewer,
  approved,
  message,
) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/early_close_request_review.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    approved,
    message,
    reviewer,
  });
};
