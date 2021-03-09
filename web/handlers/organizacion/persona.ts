import Ajv from "ajv";
import { helpers } from "oak";
import { PostgresError } from "deno_postgres";
import {
  create,
  findById,
  findReviewById,
  getAll,
  getCostTableData,
  getTableData,
} from "../../../api/models/ORGANIZACION/people.ts";
import {
  findByCode as findParameter,
} from "../../../api/models/MAESTRO/parametro.ts";
import {
  getActiveDefinition as findParameterValue,
} from "../../../api/models/MAESTRO/parametro_definicion.ts";
import {
  findByDate as findWeekByDate,
  findById as findWeek,
} from "../../../api/models/MAESTRO/dim_semana.ts";
import {
  create as createNewControl,
  findOpenWeek as findPersonOpenControl,
} from "../../../api/models/OPERACIONES/control_semana.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import {
  getFile as getTemplateFile,
} from "../../../api/storage/template_file.ts";
import {
  createApprovedReview as approveIdentificationReview,
} from "../../../api/reviews/user_identification.ts";
import {
  createApprovedReview as approvePersonalDataReview,
} from "../../../api/reviews/user_personal_data.ts";
import {
  createApprovedReview as approveResidenceReview,
} from "../../../api/reviews/user_residence.ts";
import { RouterContext } from "../../state.ts";
import { EmployeeType, TipoIdentificacion } from "../../../api/models/enums.ts";
import {
  BOOLEAN,
  EMAIL,
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  STRING,
} from "../../../lib/ajv/types.js";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { formatStandardStringToStandardNumber } from "../../../lib/date/mod.js";

const get_request = {
  $id: "get",
  properties: {
    "review": BOOLEAN,
  },
};

const list_request = {
  $id: "list",
  properties: {
    "list_retired": BOOLEAN,
  },
};

const update_request = {
  $id: "update",
  properties: {
    "employee_type": STRING(
      undefined,
      undefined,
      Object.values(EmployeeType),
    ),
    "email": EMAIL,
    "identification": STRING(15),
    "name": STRING(255),
    "phone": STRING(20),
    "retirement_date": STANDARD_DATE_STRING_OR_NULL,
    "start_date": STANDARD_DATE_STRING,
    "type": STRING(
      undefined,
      undefined,
      Object.keys(TipoIdentificacion),
    ),
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "email",
    "employee_type",
    "identification",
    "name",
    "phone",
    "start_date",
    "type",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    get_request,
    list_request,
    update_request,
  ],
});

export const createPerson = async (
  { request, response, state }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const week = await findWeekByDate(
    formatStandardStringToStandardNumber(value.start_date),
  );
  if (!week) {
    throw new Error(
      "La fecha de inicio no fue encontrada en la lista de semanas disponible",
    );
  }

  const person = await create(
    value.type,
    value.identification,
    value.name,
    value.phone,
    value.email,
    value.employee_type,
    value.start_date,
  );

  const control = await createNewControl(
    person.pk_persona,
    week.id,
  )
    .catch(async (e) => {
      await person.delete();
      throw e;
    });

  const reviewer = state.user.id;

  const personal_data_review = await approvePersonalDataReview(
    String(person.pk_persona),
    reviewer,
  )
    .catch(async (e) => {
      await control.delete();
      await person.delete();
      throw e;
    });

  const identification_review = await approveIdentificationReview(
    String(person.pk_persona),
    reviewer,
  )
    .catch(async (e) => {
      await personal_data_review.delete();
      await control.delete();
      await person.delete();
      throw e;
    });

  await approveResidenceReview(
    String(person.pk_persona),
    reviewer,
  )
    .catch(async (e) => {
      await identification_review.delete();
      await personal_data_review.delete();
      await control.delete();
      await person.delete();
      throw e;
    });

  response.body = person;
};

export const deletePerson = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const person = await findById(id);
  if (!person) throw new NotFoundError();

  await person.delete()
    .catch((e) => {
      if (e instanceof PostgresError && e.fields.constraint) {
        throw new Error(
          'La persona seleccionada esta siendo utilizada dentro del sistema. Por favor utilize el campo de "Fecha retiro" para retirarla del sistema seguramente',
        );
      } else {
        throw new Error(
          "No fue posible eliminar a la persona",
        );
      }
    });
  response.body = Message.OK;
};

export const getCostTable = (context: RouterContext) =>
  tableRequestHandler(
    context,
    getCostTableData,
  );

export const getPeople = async (ctx: RouterContext) => {
  const query_params = helpers.getQuery(ctx);

  if (!request_validator.validate("list", query_params)) {
    throw new RequestSyntaxError();
  }

  // Defaults value to false if non existent
  ctx.response.body = await getAll(
    query_params.list_retired
      ? castStringToBoolean(query_params.list_retired)
      : false,
  );
};

export const getPeopleTable = (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const getPerson = async (ctx: RouterContext<{ id: string }>) => {
  const query_params: {
    id?: string;
    review?: string;
  } = helpers.getQuery(ctx, {
    mergeParams: true,
  });

  const id = Number(query_params.id);
  if (!id) throw new RequestSyntaxError();

  if (!request_validator.validate("get", query_params)) {
    throw new RequestSyntaxError();
  }

  const person =
    await (castStringToBoolean(query_params.review ?? false)
      ? findReviewById(id)
      : findById(id));
  if (!person) throw new NotFoundError();

  ctx.response.body = person;
};

export const updatePerson = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const person = await findById(id);
  if (!person) throw new NotFoundError();

  const value: {
    employee_type: EmployeeType;
    identification: string;
    name: string;
    phone: string;
    retirement_date?: string;
    start_date: string;
    type: TipoIdentificacion;
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  const open_control = await findPersonOpenControl(id);
  if (open_control) {
    if (value.retirement_date) {
      const retirement_week = await findWeekByDate(
        formatStandardStringToStandardNumber(value.retirement_date),
      );
      if (!retirement_week) {
        throw new RequestSyntaxError(
          "La fecha de retiro no fue encontrada en el rango de fechas validas para registro de semana",
        );
      }

      const open_week = await findWeek(open_control.week);
      if (!open_week) {
        throw new Error(
          "La semana actual de registro no fue encontrada en el rango de fechas validas para registro de semana",
        );
      }

      // The retirement date can only be set if it matches the open week
      // or if it's older than the open week
      if (
        (retirement_week.id !== open_week.id) &&
        (new Date(retirement_week.end_date).getTime() >
          new Date(open_week.end_date).getTime())
      ) {
        throw new RequestSyntaxError(
          "La fecha de retiro seleccionada es superior a la fecha de registro de la persona.\n" +
            "No es posible cerrar la semana",
        );
      }

      // We close the current open week, independently of what retirement date
      // was set by the user (we don't want to delete the registry)
      await open_control.close(false);
    }
  }

  //TODO
  //Allow start_date to be updated and update control accordingly

  await person.update({
    tipo_identificacion: value.type,
    identificacion: value.identification,
    nombre: value.name,
    telefono: value.phone,
    fecha_retiro: value.retirement_date,
    tipo_empleado: value.employee_type,
  })
    .catch(() => {
      throw new Error(
        "No fue posible actualizar a la persona",
      );
    });

  response.body = person;
};

export const getPicture = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const user = Number(params.id);
  if (!user) {
    throw new RequestSyntaxError();
  }

  //TODO
  //The parameter code should be a constant
  const picture_parameter = await findParameter("PLANTILLA_FOTO_PERFIL");
  if (!picture_parameter) throw new NotFoundError();

  const picture_parameter_value = await findParameterValue(
    picture_parameter.pk_parametro,
  );
  if (!picture_parameter_value) throw new NotFoundError();

  const file = await getTemplateFile(
    picture_parameter_value.valor as number,
    user,
  )
    .catch((e) => {
      if (e.name === "NotFound") {
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
