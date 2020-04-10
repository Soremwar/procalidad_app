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
  getPeople,
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
  .get("/api/organizacion/persona", getPeople);

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

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
