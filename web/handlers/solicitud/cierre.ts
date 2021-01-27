import Ajv from "ajv";
import {
  create,
  EarlyCloseRequest,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/early_close_request.ts";
import {
  findByPersonAndWeek as findAssignationRequests,
} from "../../../api/models/OPERACIONES/asignacion_solicitud.ts";
import { decodeToken } from "../../../lib/jwt.ts";
import {
  findById as findControlWeek,
  findOpenWeek,
} from "../../../api/models/OPERACIONES/control_semana.ts";
import { BOOLEAN, STRING } from "../../../lib/ajv/types.js";
import {
  dispatchEarlyCloseRequest,
  dispatchEarlyCloseRequestReview,
} from "../../../api/email/dispatchers.js";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { RouterContext } from "../../state.ts";

const create_request = {
  $id: "create",
  properties: {
    "message": STRING(255),
  },
  required: [
    "message",
  ],
};

const review_request = {
  $id: "review",
  if: {
    properties: {
      "approved": {
        const: false,
      },
    },
  },
  then: {
    required: [
      "reason",
    ],
  },
  properties: {
    "approved": BOOLEAN,
    "reason": STRING(255),
  },
  required: [
    "approved",
  ],
};

const request_validator = new Ajv({
  schemas: [
    create_request,
    review_request,
  ],
});

export const createEarlyCloseRequest = async (
  { response, state }: RouterContext,
) => {
  const open_control = await findOpenWeek(state.user.id);
  if (!open_control) {
    throw new RequestSyntaxError(
      "La persona solicitada no se encuentra habilitada para registrar horas",
    );
  }

  if (await EarlyCloseRequest.isTaken(open_control.id)) {
    throw new Error(
      "Una solicitud para cerrar la semana ya se encuentra en revisión",
    );
  }

  //TODO
  //Enable message
  // const value = await request.body({ type: "json" }).value;
  // if (!request_validator.validate("create", value)) {
  //   throw new RequestSyntaxError();
  // }

  const early_close_request = await create(
    open_control.id,
    "",
  )
    .catch(() => {
      throw new Error("Ocurrio un error al crear la solicitud");
    });

  await dispatchEarlyCloseRequest(early_close_request.id)
    .catch(() => {
      throw new Error("No fue posible enviar el correo de solicitud");
    });

  response.body = early_close_request;
};

export const updateEarlyCloseRequest = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("review", value)) {
    throw new RequestSyntaxError();
  }

  const early_close_request = await findById(id);
  if (!early_close_request) {
    throw new NotFoundError(
      "No fue encontrada la solicitud de cierre de semana",
    );
  }

  const control = await findControlWeek(early_close_request.week_control);
  if (!control) {
    throw new RequestSyntaxError(
      "La persona solicitada no se encuentra habilitada para registrar horas",
    );
  }

  const approved = castStringToBoolean(value.approved);

  if (approved) {
    const requests = await findAssignationRequests(
      control.person,
      control.week,
    );

    for (const request of requests) {
      await request.delete();
    }

    await control.close();
  }

  await dispatchEarlyCloseRequestReview(
    early_close_request.id,
    approved,
    value.reason,
  )
    .catch(async () => {
      await early_close_request.delete();
      throw new Error("No fue posible enviar el correo de confirmación");
    });

  await early_close_request.delete();

  response.body = { approved };
};

export const getEarlyRequestRequestTable = async (
  { response, state }: RouterContext,
) => {
  response.body = await getTableData(state.user.id);
};
