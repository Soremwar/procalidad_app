import postgres from "../api/services/postgres.js";

await postgres.query(
  `SELECT * FROM CARGAR_ASIGNACION_SEMANAL()`
)
  .catch(() => {
    throw new Error('No fue posible cargar la asignacion semanal');
  });
