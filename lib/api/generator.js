import {
  requestGenerator,
} from "./request.js";

export const fetchAreaApi = requestGenerator('organizacion/area');
export const fetchAreaTypesApi = requestGenerator('organizacion/tipo_area');
export const fetchPositionAssignationApi = requestGenerator('organizacion/asignacion_cargo');
export const fetchBudgetApi = requestGenerator('operaciones/presupuesto');
export const fetchBudgetDetailApi = requestGenerator('operaciones/presupuesto_detalle');
export const fetchBudgetTypeApi = requestGenerator('operaciones/tipo_presupuesto');
export const fetchClientApi = requestGenerator('clientes/cliente');
export const fetchComputerApi = requestGenerator('organizacion/computador');
export const fetchContactApi = requestGenerator('clientes/contacto');
export const fetchLicenseApi = requestGenerator('organizacion/licencia');
export const fetchPeopleApi = requestGenerator('organizacion/persona');
export const fetchPersonCostApi = requestGenerator('organizacion/salario');
export const fetchPositionApi = requestGenerator('organizacion/cargo');
export const fetchProjectApi = requestGenerator('operaciones/proyecto');
export const fetchProjectTypeApi = requestGenerator('operaciones/tipo_proyecto');
export const fetchResourceApi = requestGenerator('planeacion/recurso');
export const fetchRoleApi = requestGenerator('operaciones/rol');
export const fetchSectorApi = requestGenerator('clientes/sector');
export const fetchSubAreaApi = requestGenerator('organizacion/sub_area');
export const fetchTimeApi = requestGenerator('maestro/tiempo');