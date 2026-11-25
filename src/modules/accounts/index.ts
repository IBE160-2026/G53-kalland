// Public API of the accounts module (AD-3). Owns (writes) the tables: tenants, clients, users.
// Clients are never deleted (S10): there is no delete function here.
export {
  CLIENT_FIELD_ERRORS,
  createClient,
  createClientAsStaff,
  getClient,
  getClientDetails,
  listActiveClients,
  listClientsForStaff,
  setClientStatus,
  updateClient,
  type Client,
  type ClientDetails,
  type ClientField,
  type ClientInput,
  type ClientListItem,
  type Status,
} from "./clients";
export { createUser, getUser, listActiveStaff, setUserStatus, type NewUser, type User } from "./users";
