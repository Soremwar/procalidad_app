import { Router } from "oak";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  getContactsTable,
  updateContact
} from "./handlers/clientes/contacto.ts";
import {
  createSector,
  deleteSector,
  getSector,
  getSectors,
  getSectorsTable,
  updateSector
} from "./handlers/clientes/sector.ts";
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  getClientsTable,
  updateClient
} from "./handlers/clientes/cliente.ts";
import {
  createProjectType,
  deleteProjectType,
  getProjectType,
  getProjectTypes,
  getProjectTypesTable,
  updateProjectType
} from "./handlers/operaciones/tipo_proyecto.ts";

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

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
