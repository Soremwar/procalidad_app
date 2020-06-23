import {
  requestGenerator,
} from "./request.js";

export const fetchAreaApi = requestGenerator('organizacion/area');
export const fetchAreaTypesApi = requestGenerator('organizacion/tipo_area');
export const fetchBudgetApi = requestGenerator('operaciones/presupuesto');
export const fetchBudgetDetailApi = requestGenerator('operaciones/presupuesto_detalle');
export const fetchBudgetTypeApi = requestGenerator('operaciones/tipo_presupuesto');
export const fetchClientApi = requestGenerator('clientes/cliente');
export const fetchContactApi = requestGenerator('clientes/contacto');
export const fetchPeopleApi = requestGenerator('organizacion/persona');
export const fetchProjectApi = requestGenerator('operaciones/proyecto');
export const fetchProjectTypeApi = requestGenerator('operaciones/tipo_proyecto');
export const fetchResourceApi = requestGenerator('planeacion/recurso');
export const fetchRoleApi = requestGenerator('operaciones/rol');
export const fetchSectorApi = requestGenerator('clientes/sector');
export const fetchSubAreaApi = requestGenerator('organizacion/sub_area');
export const fetchTimeApi = requestGenerator('maestro/tiempo');