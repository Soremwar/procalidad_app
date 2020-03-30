import { Router, RouterContext } from "oak";
import {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact
} from "./handlers/clientes/contacto.ts";
import {
  getSector,
  getSectors,
  createSector,
  updateSector,
  deleteSector
} from "./handlers/clientes/sector.ts";

const main_router = new Router();

// TODO Should be wrapped inside api_router
// It should be called inside main router
main_router
  .get("/api/clientes/contacto", getContacts)
  .post("/api/clientes/contacto", createContact)
  .get<{ id: string }>("/api/clientes/contacto/:id", getContact)
  .put<{ id: string }>("/api/clientes/contacto/:id", updateContact)
  .delete<{ id: string }>("/api/clientes/contacto/:id", deleteContact);

main_router
  .get("/api/clientes/sector", getSectors)
  .post("/api/clientes/sector", createSector)
  .get<{ id: string }>("/api/clientes/sector/:id", getSector)
  .put<{ id: string }>("/api/clientes/sector/:id", updateSector)
  .delete<{ id: string }>("/api/clientes/sector/:id", deleteSector);

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
