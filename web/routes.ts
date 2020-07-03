import { Router } from "oak";
import { checkProfileAccess } from "./middleware.ts";
import { Profiles } from "../api/common/profiles.ts";
import { createSession } from "./handlers/auth.ts";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  getContactsTable,
  updateContact,
} from "./handlers/clientes/contacto.ts";
import {
  createSector,
  deleteSector,
  getSector,
  getSectors,
  getSectorsTable,
  updateSector,
} from "./handlers/clientes/sector.ts";
import {
  getCountries,
  getCountry,
  searchCountry,
} from "./handlers/maestro/pais.ts";
import { getState, getStates, searchState } from "./handlers/maestro/estado.ts";
import { getCities, getCity, searchCity } from "./handlers/maestro/ciudad.ts";
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  getClientsTable,
  updateClient,
} from "./handlers/clientes/cliente.ts";
import {
  createProjectType,
  deleteProjectType,
  getProjectType,
  getProjectTypes,
  getProjectTypesTable,
  updateProjectType,
} from "./handlers/operaciones/tipo_proyecto.ts";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  getProjectsTable,
  searchProject,
  updateProject,
} from "./handlers/operaciones/proyecto.ts";
import {
  createPerson,
  deletePerson,
  getPeople,
  getPeopleTable,
  getPerson,
  updatePerson,
} from "./handlers/organizacion/persona.ts";
import {
  createAreaType,
  deleteAreaType,
  getAreaType,
  getAreaTypes,
  getAreaTypesTable,
  updateAreaType,
} from "./handlers/organizacion/tipo_area.ts";
import {
  createArea,
  deleteArea,
  getArea,
  getAreas,
  getAreasTable,
  updateArea,
} from "./handlers/organizacion/area.ts";
import {
  createSubArea,
  deleteSubArea,
  getSubArea,
  getSubAreas,
  getSubAreasTable,
  updateSubArea,
} from "./handlers/organizacion/sub_area.ts";
import {
  createPosition,
  deletePosition,
  getPosition,
  getPositions,
  getPositionsTable,
  updatePosition,
} from "./handlers/organizacion/cargo.ts";
import {
  createComputer,
  deleteComputer,
  getComputer,
  getComputers,
  getComputersTable,
  updateComputer,
} from "./handlers/organizacion/computador.ts";
import {
  createLicence,
  deleteLicence,
  getLicence,
  getLicences,
  getLicencesTable,
  updateLicence,
} from "./handlers/organizacion/licencia.ts";
import {
  createSalary,
  deleteSalary,
  getCalculatedSalary,
  getSalaries,
  getSalariesTable,
  getSalary,
  updateSalary,
} from "./handlers/organizacion/salario.ts";
import {
  createAssignation as createPositionAssignation,
  deleteAssignation as deletePositionAssignation,
  getAssignation as getPositionAssignation,
  getAssignations as getPositionAssignations,
  getAssignationsTable as getPositionAssignationsTable,
  updateAssignation as updatePositionAssignation,
} from "./handlers/organizacion/asignacion_cargo.ts";
import {
  createBudgetType,
  deleteBudgetType,
  getBudgetType,
  getBudgetTypes,
  getBudgetTypesTable,
  updateBudgetType,
} from "./handlers/operaciones/tipo_presupuesto.ts";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  getRolesTable,
  updateRole,
} from "./handlers/operaciones/rol.ts";
import {
  createBudget,
  deleteBudget,
  getBudget,
  getBudgets,
  getBudgetTable,
  updateBudget,
} from "./handlers/operaciones/presupuesto.ts";
import { searchBudgetDetails } from "./handlers/operaciones/presupuesto_detalle.ts";
import {
  createParameter,
  deleteParameter,
  getParameter,
  getParameters,
  getParametersTable,
  updateParameter,
} from "./handlers/maestro/parametro.ts";
import {
  createParameterDefinition,
  deleteParameterDefinition,
  getParameterDefinition,
  getParameterDefinitions,
  searchParameterDefinition,
  updateParameterDefinition,
} from "./handlers/maestro/parametro_definicion.ts";
import { getBlacklistedDays } from "./handlers/maestro/tiempo.ts";
import { getProfile, getProfiles } from "./handlers/maestro/profile.ts";
import {
  createAccess,
  deleteAccess,
  getAccess,
  getAccesses,
  getAccessesTable,
  updateAccess,
} from "./handlers/maestro/access.ts";
import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  getResourcesGantt,
  getResourcesHeatmap,
  getResourcesTable,
  updateResource,
} from "./handlers/planeacion/recurso.ts";

const main_router = new Router();

// TODO Should be wrapped inside api_router
// It should be called inside main router
// Definetely find a shorter version for permission grant (inherit?)
main_router
  .post("/api/auth", createSession);

main_router
  .get(
    "/api/maestro/parametro",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameters,
  )
  .post(
    "/api/maestro/parametro/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParametersTable,
  )
  .get<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameter,
  )
  .post(
    "/api/maestro/parametro",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createParameter,
  )
  .put<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateParameter,
  )
  .delete<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteParameter,
  );

main_router
  .get(
    "/api/maestro/parametro_definicion",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameterDefinitions,
  )
  .get(
    "/api/maestro/parametro_definicion/search",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    searchParameterDefinition,
  )
  .get<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameterDefinition,
  )
  .post<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createParameterDefinition,
  )
  .put<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateParameterDefinition,
  )
  .delete<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteParameterDefinition,
  );

main_router
  .get(
    "/api/maestro/tiempo/blacklist",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBlacklistedDays,
  );

main_router
  .get(
    "/api/maestro/permiso",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProfiles,
  )
  .get<{ id: string }>(
    "/api/maestro/permiso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProfile,
  );

main_router
  .get(
    "/api/maestro/acceso",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccesses,
  )
  .post(
    "/api/maestro/acceso/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccessesTable,
  )
  .get<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccess,
  )
  .post(
    "/api/maestro/acceso",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
    ]),
    createAccess,
  )
  .put<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
    ]),
    updateAccess,
  )
  .delete<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
    ]),
    deleteAccess,
  );

main_router
  .get(
    "/api/maestro/pais",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getCountries,
  )
  .get(
    "/api/maestro/pais/search",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchCountry,
  )
  .get<{ id: string }>(
    "/api/maestro/pais/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getCountry,
  );

main_router
  .get(
    "/api/maestro/estado",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getStates,
  )
  .get(
    "/api/maestro/estado/search",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchState,
  )
  .get<{ id: string }>(
    "/api/maestro/estado/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getState,
  );

main_router
  .get(
    "/api/maestro/ciudad",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getCities,
  )
  .get(
    "/api/maestro/ciudad/search",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchCity,
  )
  .get<{ id: string }>(
    "/api/maestro/ciudad/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getCity,
  );

main_router
  .get(
    "/api/clientes/cliente",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getClients,
  )
  .post(
    "/api/clientes/cliente/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getClientsTable,
  )
  .get<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getClient,
  )
  .post(
    "/api/clientes/cliente",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    createClient,
  )
  .put<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    updateClient,
  )
  .delete<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    deleteClient,
  );

main_router
  .get(
    "/api/clientes/contacto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getContacts,
  )
  .post(
    "/api/clientes/contacto/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getContactsTable,
  )
  .post(
    "/api/clientes/contacto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createContact,
  )
  .get<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getContact,
  )
  .put<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateContact,
  )
  .delete<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteContact,
  );

main_router
  .get(
    "/api/clientes/sector",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSectors,
  )
  .post(
    "/api/clientes/sector/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSectorsTable,
  )
  .get<{ id: string }>(
    "/api/clientes/sector/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSector,
  )
  .post(
    "/api/clientes/sector",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    createSector,
  )
  .put<{ id: string }>(
    "/api/clientes/sector/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    updateSector,
  )
  .delete<{ id: string }>(
    "/api/clientes/sector/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    deleteSector,
  );

main_router
  .get(
    "/api/operaciones/tipo_proyecto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    getProjectTypes,
  )
  .post(
    "/api/operaciones/tipo_proyecto/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    getProjectTypesTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    getProjectType,
  )
  .post(
    "/api/operaciones/tipo_proyecto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createProjectType,
  )
  .put<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateProjectType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteProjectType,
  );

main_router
  .get(
    "/api/operaciones/proyecto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProjects,
  )
  .post(
    "/api/operaciones/proyecto/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProjectsTable,
  )
  .get(
    "/api/operaciones/proyecto/search",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchProject,
  )
  .get<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProject,
  )
  .post(
    "/api/operaciones/proyecto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    createProject,
  )
  .put<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    updateProject,
  )
  .delete<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    deleteProject,
  );

main_router
  .get(
    "/api/operaciones/tipo_presupuesto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetTypes,
  )
  .post(
    "/api/operaciones/tipo_presupuesto/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetTypesTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetType,
  )
  .post(
    "/api/operaciones/tipo_presupuesto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createBudgetType,
  )
  .put<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateBudgetType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteBudgetType,
  );

main_router
  .get(
    "/api/operaciones/rol",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRoles,
  )
  .post(
    "/api/operaciones/rol/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRolesTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRole,
  )
  .post(
    "/api/operaciones/rol",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createRole,
  )
  .put<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateRole,
  )
  .delete<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteRole,
  );

main_router
  .get(
    "/api/operaciones/presupuesto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgets,
  )
  .post(
    "/api/operaciones/presupuesto/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/presupuesto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudget,
  )
  .post(
    "/api/operaciones/presupuesto",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    createBudget,
  )
  .put<{ id: string }>(
    "/api/operaciones/presupuesto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    updateBudget,
  )
  .delete<{ id: string }>(
    "/api/operaciones/presupuesto/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.SALES,
    ]),
    deleteBudget,
  );

main_router
  .get<{ id: string }>(
    "/api/operaciones/presupuesto_detalle/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchBudgetDetails,
  );

main_router
  .get(
    "/api/organizacion/tipo_area",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreaTypes,
  )
  .post(
    "/api/organizacion/tipo_area/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreaTypesTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreaType,
  )
  .post(
    "/api/organizacion/tipo_area",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createAreaType,
  )
  .put<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateAreaType,
  )
  .delete<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteAreaType,
  );

main_router
  .get(
    "/api/organizacion/area",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreas,
  )
  .post(
    "/api/organizacion/area/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreasTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getArea,
  )
  .post(
    "/api/organizacion/area",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createArea,
  )
  .put<{ id: string }>(
    "/api/organizacion/area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateArea,
  )
  .delete<{ id: string }>(
    "/api/organizacion/area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteArea,
  );

main_router
  .get(
    "/api/organizacion/sub_area",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSubAreas,
  )
  .post(
    "/api/organizacion/sub_area/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSubAreasTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSubArea,
  )
  .post(
    "/api/organizacion/sub_area",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createSubArea,
  )
  .put<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateSubArea,
  )
  .delete<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteSubArea,
  );

main_router
  .get(
    "/api/organizacion/persona",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPeople,
  )
  .post(
    "/api/organizacion/persona/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPeopleTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPerson,
  )
  .post(
    "/api/organizacion/persona",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPerson,
  )
  .put<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePerson,
  )
  .delete<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePerson,
  );

main_router
  .get(
    "/api/organizacion/cargo",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositions,
  )
  .post(
    "/api/organizacion/cargo/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositionsTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPosition,
  )
  .post(
    "/api/organizacion/cargo",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPosition,
  )
  .put<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePosition,
  )
  .delete<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePosition,
  );

main_router
  .get(
    "/api/organizacion/asignacion_cargo",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositionAssignations,
  )
  .post(
    "/api/organizacion/asignacion_cargo/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositionAssignationsTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPositionAssignation,
  )
  .post(
    "/api/organizacion/asignacion_cargo",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPositionAssignation,
  )
  .put<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePositionAssignation,
  )
  .delete<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePositionAssignation,
  );

main_router
  .get("/api/organizacion/computador", getComputers)
  .post("/api/organizacion/computador/table", getComputersTable)
  .get<{ id: string }>("/api/organizacion/computador/:id", getComputer)
  .post("/api/organizacion/computador", createComputer)
  .put<{ id: string }>("/api/organizacion/computador/:id", updateComputer)
  .delete<{ id: string }>("/api/organizacion/computador/:id", deleteComputer);

main_router
  .get(
    "/api/organizacion/licencia",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getLicences,
  )
  .post(
    "/api/organizacion/licencia/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getLicencesTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getLicence,
  )
  .post(
    "/api/organizacion/licencia",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createLicence,
  )
  .put<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updateLicence,
  )
  .delete<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deleteLicence,
  );

main_router
  .get(
    "/api/organizacion/salario",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSalaries,
  )
  .post(
    "/api/organizacion/salario/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSalariesTable,
  )
  .post(
    "/api/organizacion/salario/calculo",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getCalculatedSalary,
  )
  .get<{ id: string }>(
    "/api/organizacion/salario/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSalary,
  )
  .post(
    "/api/organizacion/salario",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createSalary,
  )
  .put<{ id: string }>(
    "/api/organizacion/salario/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updateSalary,
  )
  .delete<{ id: string }>(
    "/api/organizacion/salario/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deleteSalary,
  );

main_router
  .get(
    "/api/planeacion/recurso",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResources,
  )
  .get(
    "/api/planeacion/recurso/gantt",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesGantt,
  )
  .get(
    "/api/planeacion/recurso/heatmap",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesHeatmap,
  )
  .post(
    "/api/planeacion/recurso/table",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesTable,
  )
  .post(
    "/api/planeacion/recurso",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createResource,
  )
  .get<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResource,
  )
  .put<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateResource,
  )
  .delete<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkProfileAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteResource,
  );

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
