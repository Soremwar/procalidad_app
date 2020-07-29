import {
  dispatchRegistryDelayedUsers as sendRegistryDelayedUsersEmail,
  dispatchRegistryDelayedAreas as sendRegistryDelayedAreasEmail,
} from "../api/email/dispatchers.js";

await sendRegistryDelayedUsersEmail();
await sendRegistryDelayedAreasEmail();
