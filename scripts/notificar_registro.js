import {
  dispatchRegistryNotUpToDate as sendRegistryNotUpToDateEmail,
} from "../api/email/dispatchers.js";

await sendRegistryNotUpToDateEmail();
