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

Handlebars.registerHelper("if_equals", function (a, b, opts) {
  if (a === b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

// This function can take two or more parameters
// IT will render if any of the arguments passed to it is truthy
Handlebars.registerHelper("if_or", function (a, b, ...args) {
  if (!args.length) {
    throw new Error('"if_or" expected two or more arguments');
  }

  const opts = args[args.length - 1];
  const items = [a, b, ...args.slice(0, args.length - 1)];

  if (items.some((item) => !!item)) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

// Render element if the array supplied to it has items
Handlebars.registerHelper("if_has_items", function (a, opts) {
  if (!Array.isArray(a)) {
    throw new TypeError('"if_has_items" expected an array');
  }
  if (a.length) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

// Render element if one of the arrays supplied to it has items
Handlebars.registerHelper("if_or_has_items", function (a, b, ...args) {
  if (!args.length) {
    throw new Error('"if_or_has_items" expected two or more arguments');
  }

  const opts = args[args.length - 1];
  const items = [a, b, ...args.slice(0, args.length - 1)];

  if (!items.every((item) => Array.isArray(item))) {
    throw new TypeError(
      '"if_or_has_items" expected its arguments to be arrays',
    );
  }

  if (items.every((item) => !!item.length)) {
    return opts.fn(this);
  }
  return opts.inverse(this);
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
  week,
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
    week,
  });
};

export const createEarlyCloseRequestReviewEmail = async (
  reviewer,
  approved,
  message,
  week,
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
    week,
  });
};

export const createCertificationExpirationEmail = async (
  provider,
  certification,
  type,
  name,
  days,
) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const raw_template = await Deno.readTextFile(
    new URL("./templates/certification_expiration.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    certification: html.encode(certification),
    days,
    name: html.encode(name),
    provider: html.encode(provider),
    type: html.encode(type),
  });
};

const DEFAULT_GENERATION_PARAMETERS = {
  show_certifications: true,
  show_continuous_formation: true,
  show_general_information: true,
  show_project_contact: true,
  show_project_functions: true,
  show_project_participation_dates: true,
  show_project_participation: true,
};

export const createResumeTemplate = async ({
  academic_formation,
  certifications,
  continuous_formation,
  experience_time,
  laboral_experience,
  language_skill,
  local_experience_time,
  name,
  position,
  professional_card,
  project_experience,
  start_date,
  tool_administration,
  tool_development_skill,
  tool_installation,
}, {
  show_certifications,
  show_continuous_formation,
  show_general_information,
  show_project_contact,
  show_project_functions,
  show_project_participation_dates,
  show_project_participation,
} = DEFAULT_GENERATION_PARAMETERS) => {
  const raw_template = await Deno.readTextFile(
    new URL("./templates/cv.html", import.meta.url),
  );
  const template = Handlebars.compile(raw_template, {
    noEscape: true,
  });

  return template({
    academic_formation,
    certifications,
    continuous_formation,
    experience_time,
    laboral_experience,
    language_skill,
    local_experience_time,
    name,
    position,
    professional_card,
    project_experience,
    show_certifications,
    show_continuous_formation,
    show_general_information,
    show_project_contact,
    show_project_functions,
    show_project_participation_dates,
    show_project_participation,
    start_date,
    tool_administration,
    tool_development_skill,
    tool_installation,
  });
};
