import type { RouterContext } from "oak";
import Ajv from "ajv";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { setReview as setIdentificationReview } from "../../../api/reviews/user_identification.ts";
import { setReview as setPersonalDataReview } from "../../../api/reviews/user_personal_data.ts";
import { setReview as setResidenceReview } from "../../../api/reviews/user_residence.ts";
import { setReview as setSupportFileReview } from "../../../api/reviews/user_documents.ts";
import { getPersonFileReviewTable } from "../../../api/models/files/template_file.ts";
import { getResume as getResumeData } from "../../../api/models/ORGANIZACION/people.ts";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { BOOLEAN, STRING_OR_NULL } from "../../../lib/ajv/types.js";
import { decodeToken } from "../../../lib/jwt.ts";
import { Message } from "../../http_utils.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { createResumeTemplate } from "../../../api/email/templates.js";

enum PersonDataType {
  documentos = "documentos",
  personal = "personal",
  residencia = "residencia",
}

const resume_request = {
  $id: "resume",
  properties: {
    "certifications": BOOLEAN,
    "continuous_formation": BOOLEAN,
    "general_information": BOOLEAN,
    "preview": BOOLEAN,
    "project_experience": {
      type: "object",
      properties: {
        "all_experience": BOOLEAN,
        "contact": BOOLEAN,
        "functions": BOOLEAN,
        "participation": BOOLEAN,
        "participation_dates": BOOLEAN,
      },
      required: [
        "all_experience",
        "contact",
        "functions",
        "participation",
        "participation_dates",
      ],
    },
  },
  required: [
    "certifications",
    "continuous_formation",
    "general_information",
    "project_experience",
  ],
};

const review_request = {
  $id: "review",
  properties: {
    "approved": BOOLEAN,
    "observations": STRING_OR_NULL({
      min: 0,
      max: 255,
    }),
  },
};

const request_validator = new Ajv({
  schemas: [
    resume_request,
    review_request,
  ],
});

//TODO
//This should be a lib function
async function convertHtmlToPdf(html: string) {
  const process = Deno.run({
    cmd: [
      "wkhtmltopdf",
      "--enable-local-file-access",
      "--margin-top",
      "0",
      "--margin-left",
      "0",
      "--margin-right",
      "0",
      "--margin-bottom",
      "0",
      "--disable-smart-shrinking",
      "-q", // Quiet mode
      "-", // Write to sdtin
      "-", // Output to stdout
    ],
    stdin: "piped",
    stdout: "piped",
  });

  await Deno.writeAll(process.stdin, new TextEncoder().encode(html + "\n"));
  process.stdin.close();

  // Workaround to https://github.com/denoland/deno/issues/4568
  const output = await process.output();
  const status = await process.status();

  if (status.code === 0) {
    return output;
  } else {
    throw new Error(`Process exited with code: ${status.code}`);
  }
}

export const getResume = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person || !request.hasBody) {
    throw new RequestSyntaxError();
  }

  const generation_parameters: {
    certifications: boolean;
    continuous_formation: boolean;
    general_information: boolean;
    preview: boolean;
    project_experience: {
      all_experience: boolean;
      contact: boolean;
      functions: boolean;
      participation: boolean;
      participation_dates: boolean;
    };
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("resume", generation_parameters)) {
    throw new RequestSyntaxError();
  }

  const resume_data = await getResumeData(
    person,
    generation_parameters.project_experience.all_experience,
  );
  if (!resume_data) {
    throw new NotFoundError("No se pudo encontrar la persona solicitada");
  }

  const resume = await createResumeTemplate(resume_data, {
    show_certifications: generation_parameters.certifications,
    show_continuous_formation: generation_parameters.continuous_formation,
    show_general_information: generation_parameters.general_information,
    show_project_contact: generation_parameters.project_experience.contact,
    show_project_functions: generation_parameters.project_experience.functions,
    show_project_participation_dates:
      generation_parameters.project_experience.participation_dates,
    show_project_participation:
      generation_parameters.project_experience.participation,
  });

  if (generation_parameters.preview) {
    response.headers.append("Content-Type", "text/html");
    response.body = resume;
  } else {
    response.headers.append("Content-Type", "application/pdf");
    response.body = await convertHtmlToPdf(resume);
  }
};

export const getSupportFiles = async (
  context: RouterContext<{ id: string }>,
) => tableRequestHandler(context, getPersonFileReviewTable);

export const updatePersonReview = async (
  { cookies, params, request, response }: RouterContext<
    { tipo: string; id: string }
  >,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  if (!(params.tipo in PersonDataType)) {
    throw new RequestSyntaxError();
  }

  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("review", value)) {
    throw new RequestSyntaxError();
  }

  let setReview;
  switch (params.tipo) {
    case PersonDataType.documentos:
      setReview = setIdentificationReview;
      break;
    case PersonDataType.personal:
      setReview = setPersonalDataReview;
      break;
    case PersonDataType.residencia:
      setReview = setResidenceReview;
      break;
    default:
      throw new Error();
  }

  await setReview(
    String(id),
    user_id,
    castStringToBoolean(value.approved),
    value.observations || "",
  );

  response.body = Message.OK;
};

export const updateSupportFileReview = async (
  { cookies, params, request, response }: RouterContext<{ code: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("review", value)) {
    throw new RequestSyntaxError();
  }

  await setSupportFileReview(
    params.code,
    user_id,
    castStringToBoolean(value.approved),
    value.observations || "",
  );

  response.body = Message.OK;
};
