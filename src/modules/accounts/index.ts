// Public API of the accounts module (AD-3). Owns (writes) the tables: tenants, clients, users.
export { createClient, getClient, setClientStatus, type Client, type Status } from "./clients";
export { createUser, getUser, setUserStatus, type NewUser, type User } from "./users";
