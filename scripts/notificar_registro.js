import {
  dispatchRegistryDelayedUsers as sendRegistryDelayedUsersEmail,
  dispatchRegistryDelayedSubAreas as sendRegistryDelayedAreasEmail,
} from "../api/email/dispatchers.js";

await sendRegistryDelayedUsersEmail();
await sendRegistryDelayedAreasEmail();
