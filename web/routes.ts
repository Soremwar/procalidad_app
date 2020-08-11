import { composeMiddleware, Router } from "oak";
import { upload } from "oak_upload";
import { checkUserAccess } from "./middleware.ts";
import { Profiles } from "../api/common/profiles.ts";
import { createSession } from "./handlers/auth.ts";
import * as usuario from "./handlers/usuario.ts";
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
import * as language from "./handlers/maestro/idioma.ts";
import * as gender from "./handlers/maestro/genero.ts";
import * as marital_status from "./handlers/maestro/estado_civil.ts";
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
  searchRoles,
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
import {
  createAssignation,
  deleteAssignation,
  getAssignation,
  getAssignations,
  getAssignationWeeks,
  getAssignationsTable,
  updateAssignation,
} from "./handlers/asignacion.ts";
import {
  closePersonWeek,
  createWeekDetail,
  getPersonOpenWeek,
  getWeekDetail,
  getWeekDetailTable,
  getWeeksDetail,
  updateWeekDetail,
} from "./handlers/registro.ts";
import {
  createAssignationRequest,
  getAssignationRequestTable,
  updateAssignationRequest,
} from "./handlers/asignacion_solicitud.ts";

const main_router = new Router();

// TODO Should be wrapped inside api_router
// It should be called inside main router
// Definetely find a shorter version for permission grant (inherit?)
main_router
  .post("/api/auth", createSession);

main_router
  .get("/api/usuario/contacto", checkUserAccess(), usuario.getContacts)
  .get(
    "/api/usuario/contacto/table",
    checkUserAccess(),
    usuario.getContactsTable,
  )
  .post(
    "/api/usuario/contacto",
    checkUserAccess(),
    usuario.createContact,
  )
  .put<{ id: string }>(
    "/api/usuario/contacto/:id",
    checkUserAccess(),
    usuario.updateContact,
  )
  .delete<{ id: string }>(
    "/api/usuario/contacto/:id",
    checkUserAccess(),
    usuario.deleteContact,
  )
  .get("/api/usuario/idiomas", checkUserAccess(), usuario.getLanguageExperience)
  .get(
    "/api/usuario/idiomas/table",
    checkUserAccess(),
    usuario.getLanguageExperienceTable,
  )
  .post(
    "/api/usuario/idiomas",
    checkUserAccess(),
    usuario.createLanguageExperience,
  )
  .put<{ id: string }>(
    "/api/usuario/idiomas/:id",
    checkUserAccess(),
    usuario.updateLanguageExperience,
  )
  .delete<{ id: string }>(
    "/api/usuario/idiomas/:id",
    checkUserAccess(),
    usuario.deleteLanguageExperience,
  )
  .get("/api/usuario/hijos", checkUserAccess(), usuario.getChildren)
  .get(
    "/api/usuario/hijos/table",
    checkUserAccess(),
    usuario.getChildrenTable,
  )
  .post(
    "/api/usuario/hijos",
    checkUserAccess(),
    usuario.createChildren,
  )
  .put<{ id: string }>(
    "/api/usuario/hijos/:id",
    checkUserAccess(),
    usuario.updateChildren,
  )
  .delete<{ id: string }>(
    "/api/usuario/hijos/:id",
    checkUserAccess(),
    usuario.deleteChildren,
  )
  .get("/api/usuario/residencia", checkUserAccess(), usuario.getResidence)
  .put("/api/usuario/residencia", checkUserAccess(), usuario.updateResidence)
  .get("/api/usuario/soportes", checkUserAccess(), usuario.getSupportFiles)
  .put("/api/usuario/soportes", checkUserAccess(), usuario.updateSupportFiles)
  .get(
    "/api/usuario",
    checkUserAccess(),
    usuario.getUserInformation,
  )
  .put(
    "/api/usuario",
    checkUserAccess(),
    usuario.updateUserInformation,
  );

main_router
  .get(
    "/api/maestro/parametro",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameters,
  )
  .post(
    "/api/maestro/parametro/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParametersTable,
  )
  .get<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameter,
  )
  .post(
    "/api/maestro/parametro",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createParameter,
  )
  .put<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateParameter,
  )
  .delete<{ id: string }>(
    "/api/maestro/parametro/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteParameter,
  );

main_router
  .get(
    "/api/maestro/parametro_definicion",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameterDefinitions,
  )
  .get(
    "/api/maestro/parametro_definicion/search",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    searchParameterDefinition,
  )
  .get<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getParameterDefinition,
  )
  .post<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createParameterDefinition,
  )
  .put<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateParameterDefinition,
  )
  .delete<{ id: string }>(
    "/api/maestro/parametro_definicion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteParameterDefinition,
  );

main_router
  .get(
    "/api/maestro/tiempo/blacklist",
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccesses,
  )
  .post(
    "/api/maestro/acceso/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccessesTable,
  )
  .get<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    getAccess,
  )
  .post(
    "/api/maestro/acceso",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    createAccess,
  )
  .put<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    updateAccess,
  )
  .delete<{ id: string }>(
    "/api/maestro/acceso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
    ]),
    deleteAccess,
  );

main_router
  .get(
    "/api/maestro/pais",
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
<<<<<<< HEAD
=======
    "/api/maestro/formato",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getFormats,
  )
  .post(
    "/api/maestro/formato/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    getFormatsTable,
  )
  .get<{ id: string }>(
    "/api/maestro/formato/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getFormat,
  )
  .post(
    "/api/maestro/formato",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createFormat,
  )
  .put<{ id: string }>(
    "/api/maestro/formato/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateFormat,
  )
  .delete<{ id: string }>(
    "/api/maestro/formato/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteFormat,
  );

main_router
  .get("/api/maestro/idioma", checkUserAccess(), language.getLanguages);

main_router
  .get("/api/maestro/genero", checkUserAccess(), gender.getGenders);

main_router
  .get(
    "/api/maestro/estado_civil",
    checkUserAccess(),
    marital_status.getMaritalStatuses,
  )
  .get<{ id: string }>(
    "/api/maestro/estado_civil/:id",
    checkUserAccess(),
    marital_status.getMaritalStatus,
  );

main_router
  .get(
>>>>>>> 52341ee... Formularios secundarios
    "/api/clientes/cliente",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getClients,
  )
  .post(
    "/api/clientes/cliente/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getClient,
  )
  .post(
    "/api/clientes/cliente",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    createClient,
  )
  .put<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    updateClient,
  )
  .delete<{ id: string }>(
    "/api/clientes/cliente/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    deleteClient,
  );

main_router
  .get(
    "/api/clientes/contacto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getContacts,
  )
  .post(
    "/api/clientes/contacto/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createContact,
  )
  .get<{ id: string }>(
    "/api/clientes/contacto/:id",
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSectors,
  )
  .post(
    "/api/clientes/sector/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSector,
  )
  .post(
    "/api/clientes/sector",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    createSector,
  )
  .put<{ id: string }>(
    "/api/clientes/sector/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    updateSector,
  )
  .delete<{ id: string }>(
    "/api/clientes/sector/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.SALES,
    ]),
    deleteSector,
  );

main_router
  .get(
    "/api/operaciones/tipo_proyecto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProjectTypes,
  )
  .post(
    "/api/operaciones/tipo_proyecto/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
    ]),
    getProjectTypesTable,
  )
  .get<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProjectType,
  )
  .post(
    "/api/operaciones/tipo_proyecto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createProjectType,
  )
  .put<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateProjectType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteProjectType,
  );

main_router
  .get(
    "/api/operaciones/proyecto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getProjects,
  )
  .post(
    "/api/operaciones/proyecto/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchProject,
  )
  .get<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetTypes,
  )
  .post(
    "/api/operaciones/tipo_presupuesto/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgetType,
  )
  .post(
    "/api/operaciones/tipo_presupuesto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createBudgetType,
  )
  .put<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateBudgetType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteBudgetType,
  );

main_router
  .get(
    "/api/operaciones/rol",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRoles,
  )
  .post(
    "/api/operaciones/rol/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRolesTable,
  )
  .get(
    "/api/operaciones/rol/search",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    searchRoles,
  )
  .get<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getRole,
  )
  .post(
    "/api/operaciones/rol",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createRole,
  )
  .put<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateRole,
  )
  .delete<{ id: string }>(
    "/api/operaciones/rol/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteRole,
  );

main_router
  .get(
    "/api/operaciones/presupuesto",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudgets,
  )
  .post(
    "/api/operaciones/presupuesto/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getBudget,
  )
  .post(
    "/api/operaciones/presupuesto",
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAreaTypes,
  )
  .post(
    "/api/organizacion/tipo_area/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreaTypesTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAreaType,
  )
  .post(
    "/api/organizacion/tipo_area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createAreaType,
  )
  .put<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateAreaType,
  )
  .delete<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteAreaType,
  );

main_router
  .get(
    "/api/organizacion/area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAreas,
  )
  .post(
    "/api/organizacion/area/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getAreasTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getArea,
  )
  .post(
    "/api/organizacion/area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createArea,
  )
  .put<{ id: string }>(
    "/api/organizacion/area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateArea,
  )
  .delete<{ id: string }>(
    "/api/organizacion/area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteArea,
  );

main_router
  .get(
    "/api/organizacion/sub_area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSubAreas,
  )
  .post(
    "/api/organizacion/sub_area/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSubAreasTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSubArea,
  )
  .post(
    "/api/organizacion/sub_area",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    createSubArea,
  )
  .put<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    updateSubArea,
  )
  .delete<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
    ]),
    deleteSubArea,
  );

main_router
  .get(
    "/api/organizacion/persona",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getPeople,
  )
  .post(
    "/api/organizacion/persona/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
    ]),
    getPeopleTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getPerson,
  )
  .post(
    "/api/organizacion/persona",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPerson,
  )
  .put<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePerson,
  )
  .delete<{ id: string }>(
    "/api/organizacion/persona/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePerson,
  );

main_router
  .get(
    "/api/organizacion/cargo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getPositions,
  )
  .post(
    "/api/organizacion/cargo/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getPosition,
  )
  .post(
    "/api/organizacion/cargo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPosition,
  )
  .put<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePosition,
  )
  .delete<{ id: string }>(
    "/api/organizacion/cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePosition,
  );

main_router
  .get(
    "/api/organizacion/asignacion_cargo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getPositionAssignations,
  )
  .post(
    "/api/organizacion/asignacion_cargo/table",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getPositionAssignation,
  )
  .post(
    "/api/organizacion/asignacion_cargo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createPositionAssignation,
  )
  .put<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updatePositionAssignation,
  )
  .delete<{ id: string }>(
    "/api/organizacion/asignacion_cargo/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deletePositionAssignation,
  );

main_router
  .get(
    "/api/organizacion/computador",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getComputers,
  )
  .post(
    "/api/organizacion/computador/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getComputersTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/computador/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getComputer,
  )
  .post(
    "/api/organizacion/computador",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createComputer,
  )
  .put<{ id: string }>(
    "/api/organizacion/computador/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updateComputer,
  )
  .delete<{ id: string }>(
    "/api/organizacion/computador/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deleteComputer,
  );

main_router
  .get(
    "/api/organizacion/licencia",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getLicences,
  )
  .post(
    "/api/organizacion/licencia/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getLicencesTable,
  )
  .get<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getLicence,
  )
  .post(
    "/api/organizacion/licencia",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createLicence,
  )
  .put<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updateLicence,
  )
  .delete<{ id: string }>(
    "/api/organizacion/licencia/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deleteLicence,
  );

main_router
  .get(
    "/api/organizacion/salario",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSalaries,
  )
  .post(
    "/api/organizacion/salario/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getSalariesTable,
  )
  .post(
    "/api/organizacion/salario/calculo",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    getCalculatedSalary,
  )
  .get<{ id: string }>(
    "/api/organizacion/salario/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getSalary,
  )
  .post(
    "/api/organizacion/salario",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    createSalary,
  )
  .put<{ id: string }>(
    "/api/organizacion/salario/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    updateSalary,
  )
  .delete<{ id: string }>(
    "/api/organizacion/salario/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ]),
    deleteSalary,
  );

main_router
  .get(
    "/api/planeacion/recurso",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResources,
  )
  .get(
    "/api/planeacion/recurso/gantt",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesGantt,
  )
  .post(
    "/api/planeacion/recurso/heatmap",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResourcesTable,
  )
  .get<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getResource,
  )
  .post(
    "/api/planeacion/recurso",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createResource,
  )
  .put<{ id: string }>(
    "/api/planeacion/recurso/:id",
    checkUserAccess([
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
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteResource,
  );

main_router
  .get(
    "/api/asignacion/asignacion",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignations,
  )
  .get(
    "/api/asignacion/asignacion/semanas",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignationWeeks,
  )
  .get<{ id: string }>(
    "/api/asignacion/asignacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONSULTANT,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignation,
  )
  .post(
    "/api/asignacion/asignacion/table",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignationsTable,
  )
  .post(
    "/api/asignacion/asignacion",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    createAssignation,
  )
  .put<{ id: string }>(
    "/api/asignacion/asignacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateAssignation,
  )
  .delete<{ id: string }>(
    "/api/asignacion/asignacion/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    deleteAssignation,
  );

main_router
  .get(
    "/api/registro",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    getWeeksDetail,
  )
  .get<{ person: string }>(
    "/api/registro/semana/:person",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    getPersonOpenWeek,
  )
  .put<{ person: string }>(
    "/api/registro/semana/:person",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    closePersonWeek,
  )
  .get<{ id: string }>(
    "/api/registro/:id",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    getWeekDetail,
  )
  .get<{ id: string }>(
    "/api/registro/table/:id",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    getWeekDetailTable,
  )
  .post<{ person: string }>(
    "/api/registro/:person",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    createWeekDetail,
  )
  .put<{ id: string }>(
    "/api/registro/:id",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    updateWeekDetail,
  );

main_router
  .get<{ person: string }>(
    "/api/asignacion_solicitud/table/:person",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    getAssignationRequestTable,
  )
  .post<{ person: string }>(
    "/api/asignacion_solicitud/:person",
    checkUserAccess([
      Profiles.CONSULTANT,
    ]),
    createAssignationRequest,
  )
  .put<{ id: string }>(
    "/api/asignacion_solicitud/:id",
    checkUserAccess([
      Profiles.ADMINISTRATOR,
      Profiles.AREA_MANAGER,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
      Profiles.PROYECT_MANAGER,
      Profiles.SALES,
    ]),
    updateAssignationRequest,
  );

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
