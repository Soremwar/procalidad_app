import {
  dispatchRegistryDelayedSubAreas as sendRegistryDelayedAreasEmail,
  dispatchRegistryDelayedUsers as sendRegistryDelayedUsersEmail,
} from "../api/email/dispatchers.js";

await sendRegistryDelayedUsersEmail();
await sendRegistryDelayedAreasEmail();
