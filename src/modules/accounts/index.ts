// Public API of the accounts module (AD-3). Owns (writes) the tables: tenants, clients, users.
// Clients and users are never deleted (S10): there is no delete function here.
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
export {
  CONTACT_EMAIL_TAKEN,
  CONTACT_FIELD_ERRORS,
  CONTACT_NAME_MAX,
  createContact,
  EMAIL_MAX,
  getContactForStaff,
  isValidPhone,
  listContactsForStaff,
  setContactStatus,
  updateContact,
  type Contact,
  type ContactField,
  type ContactInput,
} from "./contacts";
export { createUser, getUser, listActiveStaff, setUserStatus, type NewUser, type User } from "./users";
