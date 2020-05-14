import { Router } from "oak";
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
import {
  getStates,
  getState,
  searchState,
} from "./handlers/maestro/estado.ts";
import {
  getCities,
  getCity,
  searchCity,
} from "./handlers/maestro/ciudad.ts";
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
  getPerson,
  getPeopleTable,
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
import {
  createParameter,
  deleteParameter,
  getParameter,
  getParameters,
  getParametersTable,
  updateParameter,
} from "./handlers/maestro/parametro.ts";

const main_router = new Router();

// TODO Should be wrapped inside api_router
// It should be called inside main router
main_router
  .get("/api/clientes/contacto", getContacts)
  .post("/api/clientes/contacto/table", getContactsTable)
  .post("/api/clientes/contacto", createContact)
  .get<{ id: string }>("/api/clientes/contacto/:id", getContact)
  .put<{ id: string }>("/api/clientes/contacto/:id", updateContact)
  .delete<{ id: string }>("/api/clientes/contacto/:id", deleteContact);

main_router
  .get("/api/clientes/sector", getSectors)
  .post("/api/clientes/sector/table", getSectorsTable)
  .post("/api/clientes/sector", createSector)
  .get<{ id: string }>("/api/clientes/sector/:id", getSector)
  .put<{ id: string }>("/api/clientes/sector/:id", updateSector)
  .delete<{ id: string }>("/api/clientes/sector/:id", deleteSector);

main_router
  .get("/api/maestro/pais", getCountries)
  .get("/api/maestro/pais/search", searchCountry)
  .get<{ id: string }>("/api/maestro/pais/:id", getCountry);

main_router
  .get("/api/maestro/estado", getStates)
  .get("/api/maestro/estado/search", searchState)
  .get<{ id: string }>("/api/maestro/estado/:id", getState);

main_router
  .get("/api/maestro/ciudad", getCities)
  .get("/api/maestro/ciudad/search", searchCity)
  .get<{ id: string }>("/api/maestro/ciudad/:id", getCity);

main_router
  .get("/api/clientes/cliente", getClients)
  .post("/api/clientes/cliente/table", getClientsTable)
  .post("/api/clientes/cliente", createClient)
  .get<{ id: string }>("/api/clientes/cliente/:id", getClient)
  .put<{ id: string }>("/api/clientes/cliente/:id", updateClient)
  .delete<{ id: string }>("/api/clientes/cliente/:id", deleteClient);

main_router
  .get("/api/operaciones/tipo_proyecto", getProjectTypes)
  .post("/api/operaciones/tipo_proyecto/table", getProjectTypesTable)
  .post("/api/operaciones/tipo_proyecto", createProjectType)
  .get<{ id: string }>("/api/operaciones/tipo_proyecto/:id", getProjectType)
  .put<{ id: string }>("/api/operaciones/tipo_proyecto/:id", updateProjectType)
  .delete<{ id: string }>(
    "/api/operaciones/tipo_proyecto/:id",
    deleteProjectType,
  );

main_router
  .get("/api/operaciones/proyecto", getProjects)
  .post("/api/operaciones/proyecto/table", getProjectsTable)
  .post("/api/operaciones/proyecto", createProject)
  .get<{ id: string }>("/api/operaciones/proyecto/search", searchProject)
  .get<{ id: string }>("/api/operaciones/proyecto/:id", getProject)
  .put<{ id: string }>("/api/operaciones/proyecto/:id", updateProject)
  .delete<{ id: string }>(
    "/api/operaciones/proyecto/:id",
    deleteProject,
  );

main_router
  .get("/api/organizacion/persona", getPeople)
  .post("/api/organizacion/persona/table", getPeopleTable)
  .post("/api/organizacion/persona", createPerson)
  .get<{ id: string }>("/api/organizacion/persona/:id", getPerson)
  .put<{ id: string }>("/api/organizacion/persona/:id", updatePerson)
  .delete<{ id: string }>("/api/organizacion/persona/:id", deletePerson);

main_router
  .get("/api/organizacion/tipo_area", getAreaTypes)
  .post("/api/organizacion/tipo_area/table", getAreaTypesTable)
  .post("/api/organizacion/tipo_area", createAreaType)
  .get<{ id: string }>("/api/organizacion/tipo_area/:id", getAreaType)
  .put<{ id: string }>("/api/organizacion/tipo_area/:id", updateAreaType)
  .delete<{ id: string }>(
    "/api/organizacion/tipo_area/:id",
    deleteAreaType,
  );

main_router
  .get("/api/organizacion/area", getAreas)
  .post("/api/organizacion/area/table", getAreasTable)
  .post("/api/organizacion/area", createArea)
  .get<{ id: string }>("/api/organizacion/area/:id", getArea)
  .put<{ id: string }>("/api/organizacion/area/:id", updateArea)
  .delete<{ id: string }>(
    "/api/organizacion/area/:id",
    deleteArea,
  );

main_router
  .get("/api/organizacion/sub_area", getSubAreas)
  .post("/api/organizacion/sub_area/table", getSubAreasTable)
  .post("/api/organizacion/sub_area", createSubArea)
  .get<{ id: string }>("/api/organizacion/sub_area/:id", getSubArea)
  .put<{ id: string }>("/api/organizacion/sub_area/:id", updateSubArea)
  .delete<{ id: string }>(
    "/api/organizacion/sub_area/:id",
    deleteSubArea,
  );

main_router
  .get("/api/organizacion/cargo", getPositions)
  .post("/api/organizacion/cargo/table", getPositionsTable)
  .post("/api/organizacion/cargo", createPosition)
  .get<{ id: string }>("/api/organizacion/cargo/:id", getPosition)
  .put<{ id: string }>("/api/organizacion/cargo/:id", updatePosition)
  .delete<{ id: string }>("/api/organizacion/cargo/:id", deletePosition);

main_router
  .get("/api/operaciones/tipo_presupuesto", getBudgetTypes)
  .post("/api/operaciones/tipo_presupuesto/table", getBudgetTypesTable)
  .post("/api/operaciones/tipo_presupuesto", createBudgetType)
  .get<{ id: string }>("/api/operaciones/tipo_presupuesto/:id", getBudgetType)
  .put<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    updateBudgetType,
  )
  .delete<{ id: string }>(
    "/api/operaciones/tipo_presupuesto/:id",
    deleteBudgetType,
  );

main_router
  .get("/api/operaciones/rol", getRoles)
  .post("/api/operaciones/rol/table", getRolesTable)
  .post("/api/operaciones/rol", createRole)
  .get<{ id: string }>("/api/operaciones/rol/:id", getRole)
  .put<{ id: string }>("/api/operaciones/rol/:id", updateRole)
  .delete<{ id: string }>("/api/operaciones/rol/:id", deleteRole);

main_router
  .get("/api/operaciones/presupuesto", getBudgets)
  .post("/api/operaciones/presupuesto/table", getBudgetTable)
  .post("/api/operaciones/presupuesto", createBudget)
  .get<{ id: string }>("/api/operaciones/presupuesto/:id", getBudget)
  .put<{ id: string }>("/api/operaciones/presupuesto/:id", updateBudget)
  .delete<{ id: string }>("/api/operaciones/presupuesto/:id", deleteBudget);

main_router
  .get("/api/maestro/parametro", getParameters)
  .post("/api/maestro/parametro/table", getParametersTable)
  .post("/api/maestro/parametro", createParameter)
  .get<{ id: string }>("/api/maestro/parametro/:id", getParameter)
  .put<{ id: string }>("/api/maestro/parametro/:id", updateParameter)
  .delete<{ id: string }>("/api/maestro/parametro/:id", deleteParameter);

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
