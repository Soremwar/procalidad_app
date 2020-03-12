import { Router, RouterContext } from "oak";
import {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact
} from "./handlers/clientes/contacto.ts";
import app from "../components/App.jsx";

const main_router = new Router();

//TODO
//Replace with react rendered app
main_router.get("/", async ({ response }: RouterContext) => {
  response.body = app;
});

// TODO Should be wrapped inside api_router
// It should be called inside main router
main_router
  .get("/api/clientes/contacto", getContacts)
  .post("/api/clientes/contacto", createContact)
  .get<{ id: string }>("/api/clientes/contacto/:id", getContact)
  .put<{ id: string }>("/api/clientes/contacto/:id", updateContact)
  .delete<{ id: string }>("/api/clientes/contacto/:id", deleteContact);

export const routes = main_router.routes();
export const allowedMethods = main_router.allowedMethods();
