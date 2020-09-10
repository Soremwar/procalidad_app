import {
  requestGenerator,
} from "./request.js";

export const fetchAccessApi = requestGenerator("maestro/acceso");
export const fetchAreaApi = requestGenerator("organizacion/area");
export const fetchAreaTypesApi = requestGenerator("organizacion/tipo_area");
export const fetchAssignationApi = requestGenerator("asignacion/asignacion");
export const fetchAssignationRequestApi = requestGenerator(
  "asignacion_solicitud",
);
export const fetchAuthApi = requestGenerator("auth");
export const fetchBudgetApi = requestGenerator("operaciones/presupuesto");
export const fetchBudgetDetailApi = requestGenerator(
  "operaciones/presupuesto_detalle",
);
export const fetchBudgetTypeApi = requestGenerator(
  "operaciones/tipo_presupuesto",
);
export const fetchCityApi = requestGenerator("maestro/ciudad");
export const fetchClientApi = requestGenerator("clientes/cliente");
export const fetchComputerApi = requestGenerator("organizacion/computador");
export const fetchContactApi = requestGenerator("clientes/contacto");
export const fetchCountryApi = requestGenerator("maestro/pais");
export const fetchFileTemplateApi = requestGenerator("maestro/plantilla");
export const fetchFormatApi = requestGenerator("maestro/formato");
export const fetchFormationLevelApi = requestGenerator(
  "maestro/nivel_formacion",
);
export const fetchGenderApi = requestGenerator("maestro/genero");
export const fetchLanguageApi = requestGenerator("maestro/idioma");
export const fetchLicenseApi = requestGenerator("organizacion/licencia");
export const fetchMaritalStatus = requestGenerator("maestro/estado_civil");
export const fetchParameterApi = requestGenerator("maestro/parametro");
export const fetchPeopleApi = requestGenerator("organizacion/persona");
export const fetchPersonCostApi = requestGenerator("organizacion/salario");
export const fetchPositionApi = requestGenerator("organizacion/cargo");
export const fetchPositionAssignationApi = requestGenerator(
  "organizacion/asignacion_cargo",
);
export const fetchProfileApi = requestGenerator("maestro/permiso");
export const fetchProjectApi = requestGenerator("operaciones/proyecto");
export const fetchProjectTypeApi = requestGenerator(
  "operaciones/tipo_proyecto",
);
export const fetchResourceApi = requestGenerator("planeacion/recurso");
export const fetchRoleApi = requestGenerator("operaciones/rol");
export const fetchSectorApi = requestGenerator("clientes/sector");
export const fetchStateApi = requestGenerator("maestro/estado");
export const fetchSubAreaApi = requestGenerator("organizacion/sub_area");
export const fetchTimeApi = requestGenerator("maestro/tiempo");
export const fetchUserApi = requestGenerator("usuario");
export const fetchUserAcademicFormation = requestGenerator(
  "usuario/formacion/academica",
);
export const fetchUserContinuousFormation = requestGenerator(
  "usuario/formacion/continuada",
);
export const fetchUserLaboralExperience = requestGenerator(
  "usuario/experiencia/laboral",
);
export const fetchUserTrainingFormation = requestGenerator(
  "usuario/formacion/capacitacion",
);
export const fetchWeekDetailApi = requestGenerator("registro");
