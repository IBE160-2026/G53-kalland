# Epic 2 Context: Onboarding clients and contacts (UJ-4)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give staff the client register and account administration that sit next to the image library: staff create and edit clients and their contacts, hand each new user a copyable setup link (the app sends no email), and contacts set their own password and land in their client's portal. Deactivating a contact or setting a client inactive takes effect on the user's next request, and no contact can ever reach a staff route or staff data. Bonus stories add a one-page client card, staff account management and a delay on repeated failed logins. This realizes the onboarding journey (Ida onboards Fjordkaffe AS with two contacts) and completes the role separation that Epic 1 started.

## Stories

- Story 2.1: Staff create and manage clients
- Story 2.2: Staff add and manage contacts
- Story 2.3: Contacts set their password from a setup link
- Story 2.4: Contacts can never reach staff routes or data
- Story 2.5: Staff see everything about a client on one card [bonus]
- Story 2.6: Staff manage staff accounts [bonus]
- Story 2.7: Repeated failed logins are slowed down [bonus]

## Requirements & Constraints

- **Clients:** name (required), optional org number, status active/inactive, billing email, account manager (an active staff user), staff notes. Org number must be 9 digits and pass the mod-11 check. Clients can be set inactive and active again but never deleted: no UI action, route or module function (S10).
- **Contacts:** name, email, optional phone; role contact with the client's id. Email is the login and is unique across all users (staff and contacts). Changing an email keeps the same user id, licences and history. Deactivating a contact deletes nothing; its licences stay the client's.
- **Staff users (bonus):** created, edited, deactivated, reactivated the same way. The last active staff user can never be deactivated, including under concurrent deactivations (S9, tested as parallel transactions).
- **Setup links:** creating a user or resetting a password yields a single-use link valid 7 days; a new link cancels earlier unused links for that user. Used, expired or replaced links go to Login with the expired message (S8). Passwords at least 12 characters. Setting a password ends all the user's other sessions and logs the user in (contacts land on the client landing page).
- **Login and status:** wrong email and wrong password give the same message. Status is re-checked on every request: a deactivated user or a contact of an inactive client is refused on the next request (S1, S2).
- **Roles:** a contact requesting any staff page or staff data gets 403 with no data (S6). Staff notes, account managers, visibility lists and other clients' data never appear on contact pages.
- **Login delay (bonus):** after 10 failed logins for one email within 15 minutes, further attempts (any password) are refused with a plain "wait a few minutes" message until the window passes; unknown emails are delayed identically; a successful login clears the count. Test with a controlled clock.
- **Fixed messages, tested word for word:**
  - "Incorrect email or password. Contact the agency to set up a new password."
  - "Link expired. Contact the agency for a new one."
  - "Your account is not active. Contact the agency."
- Every other error is plain English with a next step; all UI strings live in `messages/en.json`.
- Double submits must not create duplicates; invalid input never crashes.

## Technical Decisions

- **Module ownership:** `accounts` owns and alone writes `tenants`, `clients`, `users` (role, clientId, status, email). `auth` owns `credentials`, `sessions`, `setup_links`, `login_attempts`. Other modules may read these tables but write only through the owner's `index.ts` functions.
- **Setup links:** only auth touches tokens and hashes. Accounts calls `auth.issueSetupLink(tx, userId)` inside the same transaction that creates the user. Tokens are random, stored hashed, never logged. Passwords hashed with argon2id.
- **Guards:** every page, Server Action and Route Handler starts with `requireStaff()` or `requireContact()`; layouts are display only. Guards return an `Actor { userId, role, clientId? }` and re-check user active and, for contacts, client active on every call.
- **Write functions** take `tx` first and the `Actor`, assert the required role (throw `Forbidden` for a contact), and own the whole use case and its transaction. A contact's `clientId`/`userId` come only from the `Actor`, never from input.
- **Routes are thin:** guard → zod parse → one module write function per mutation (Server Actions for forms). GET never writes; Route Handlers reject state changes whose `Origin` ≠ `APP_ORIGIN`.
- **Validation:** zod at the route boundary; emails trimmed and lower-cased, unique on `lower(email)`.
- **Idempotency:** unique constraints where a natural key exists; creates without one (e.g. a client) carry a form nonce stored with a unique index. Races (e.g. last active staff user) prevented by conditional updates.
- **Deletes:** foreign keys `on delete restrict`; there is no delete path for clients or users.
- **Errors:** modules throw `NotFound`, `Forbidden`, `Conflict`, `Validation`, `Locked` with message keys; one shared helper maps them to HTTP status / form state and the fixed texts.
- **Conventions:** UUID v7 ids (never sequential in URLs); `tenantId` NOT NULL on users and clients via `DEFAULT_TENANT_ID`; `timestamptz` UTC shown in Europe/Oslo; tables snake_case plural; pino logging that never logs passwords, tokens or setup links. Migrations via `drizzle-kit generate`, forward-only.
- **Guard test:** discovers every staff Route Handler and staff page from the route tree (not a hand-kept list) and calls each as a logged-in contact expecting 403 and no data; calls every exported module write function with a contact `Actor` expecting `Forbidden`, failing if a new write function lacks a role assertion.
- **Client card (bonus):** visible images must be computed with the access module's single "visible to client X" condition so the count matches the client's own view; licence history includes revoked licences.
- **Tests:** access/mutation tests run against a real database using the shared seed fixture and `loginAs`; state-changing tests create their own rows through fixture factories, never the matrix rows.

## UX & Interaction Patterns

- **Clients tab:** the context sidebar lists clients (name; contact count — later also own images — on the sub-line; licence count on the right), newest first, with a one-sentence empty state. "Add client" is a text action that opens the form. At ≤ 900 px the sidebar becomes an overlay drawer.
- **Forms:** inline per-field errors (empty name, invalid billing email, org number 9 digits/mod-11, duplicate email); nothing saved on any error.
- **Status:** inactive clients and deactivated users are shown as inactive; never a delete action.
- **Setup link:** shown to staff with a Copy button and a short "Copied" status; "new link" for a reset cancels the old one.
- **Set password page:** one centred form on canvas with no navigation (like Login); inline error for under 12 characters keeps the link valid.
- **Tables:** Designsystemet data tables, newest first, a row opens its record; every list has an empty state. 403 page for contacts on staff routes.
- **Staff users** live under Settings (account menu) → Staff users.
- Use glossary terms exactly: client, contact, licence (not customer, user, purchase).

## Cross-Story Dependencies

- Builds on Epic 1's auth module, guards, `Actor`, session handling, seed fixture and `loginAs` (Story 1.2) and the staff shell with the Clients tab (Story 1.3).
- 2.1 (clients) precedes 2.2 (contacts belong to a client); 2.3 hooks setup-link creation into contact creation from 2.2 and is reused by 2.6 for staff users.
- 2.4 covers all staff routes built so far and must keep catching new ones automatically in later epics.
- 2.5 depends on 2.1/2.2 plus the access module's visibility condition and licences from Epic 1 (and Epic 5's licence history).
- 2.7 extends the Epic 1 login flow; it is required before rollout (rollout gate) even if cut from v1.
- If the action log (FR-42a, Epic 6) is built, client/user changes and setup-link creation are recorded through `activity.record(tx, …)` in the same transaction.
