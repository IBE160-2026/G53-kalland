# Addendum: CRM-DAM

Supporting depth for the product brief — not required to understand the vision, but useful context for the PRD and architecture stages.

## Comparable products (research digest)

- **Bynder** — enterprise DAM; strongest brand-portal and digital rights management (tracks license expiry, per-asset usage rights). Closest existing match to "restricted access per client," but not a public storefront.
- **Brandfolder** — granular permissions, share links, collaborative workspaces; generally cheaper and easier to adopt than Bynder.
- **Canto** — mid-market; user roles, share portals, approval workflows, AI visual search, facial recognition, auto-tagging.
- **Cloudinary DAM** — developer-oriented; strong AI metadata and alt-text generation (GPT-4 Vision-based), programmatic image transforms.
- None of the above are marketed as a true public-facing stock-photo storefront with per-client gating — that combination (internal DAM discipline plus a gated multi-client storefront) is where CRM-DAM differs, not an area where it needs to catch up.
- AI-generated metadata (auto-tagging, alt-text, description) is table-stakes among the leaders above — worth treating as an expected baseline in the PRD, not a headline feature.
- 2026 trend to be aware of: "agentic" DAM features (Bynder AI Agents, Aprimo Agentic DAM) going beyond tagging — out of scope now, but useful context if the product's AI story needs to evolve later.

## Access-model data shape

Two independent fields per image, not a single enum:

- `visibility`: `public` | `restricted` (with an associated list of client IDs) | `internal_only` (empty/no client list)
- `price`: `free` | `paid` (one-time; buy-and-keep)

"Owned/free" (a client's own commissioned work) is simply `restricted` to that one client + `free`. A general paid stock image is `public` + `paid`. This avoids modeling "owned" as a separate category that would overlap with restricted-stock-pool images, which is what the early draft of this brief got wrong before being corrected in discovery.

What a client gets per combination, as the basis for the access test matrix:

| Visibility (for this client) | Free | Paid, no licence | Licence held (bought, or free and downloaded) |
|---|---|---|---|
| Public, or restricted and client is on the list | See, download original (first download records a 0 kr licence) | See small preview (no watermark), buy | See, download original |
| Restricted and client is not on the list | Nothing (404) | Nothing (404) | See, download original |
| Internal-only | Nothing (404) | Nothing (404) | See, download original |

Resolved 2026-10-28 (was an open question): a licence survives later changes of visibility and price, archiving, and the contact leaving. Clients without a licence lose access when an image is unshared. Taking a licence away is a separate admin action — **revoke** — with a warning listing affected licences, a required reason, and a "remove anyway" confirmation; the licence is marked revoked (never deleted), revoked paid licences are flagged for a possible credit, and the client's history shows the image as "removed by the agency". Images with licences are archived, never hard-deleted; permanent file deletion is out of v1. The full truth table and edge tests are in `_bmad-output/brainstorming/brainstorm-client-model-access-2026-10-28/brainstorm-intent.md`.

## Client model

- A client is an **organisation** with one or more **contacts**; in v1 each contact belongs to one organisation. Access, licences and history belong to the organisation; the contact is recorded for login and audit, and all contacts see the organisation's licence history.
- Agency admins create organisations and contacts. Contacts log in with email and password; the first password (and any reset) is set through a single-use, expiring setup link the admin copies into their own email, since v1 sends no email. In stage 2 the same link is sent by email.
- Minimal organisation record: name, org number (optional, validated), status, billing email, account manager, staff notes, `tenant_id`.
- **Licences:** what a client acquires is a licence. v1 has one licence type, standard commercial use, with one standard licence text; each licence stores its type and text version so later licence types (editorial, private, free use) do not change existing licences.

## Metadata handling

- **On upload:** read all embedded metadata (EXIF, IPTC, XMP, including GPS and camera data), then ask the AI provider for title, description, alt-text, and keywords.
- **Source of truth:** the database. Every field is editable by staff, because both embedded data and AI suggestions can be wrong.
- **Write on export:** the stored original file is never modified. When a file is downloaded, the current metadata is written into the outgoing copy. Rejected alternative — writing edits into the stored file — would change the file's hash on every edit, so a re-upload of the original would no longer be caught as a duplicate, and it would blur what a "version" is.
- **GPS:** kept internally (stored as latitude/longitude fields, ready for the stage-2 map view) and stripped from every copy downloaded by a client.

## AI providers

- One provider interface: input is an image (and its embedded metadata); output is title, description, alt-text, keywords, or an error.
- **v1:** a mock provider (fixed, predictable output; default in tests and for the examiner) and a Claude API provider (small vision model, API key). The app sends the extracted embedded metadata as text with the image, because the API does not read file metadata.
- **Why not the Claude Code CLI (changed 2026-10-28):** Anthropic reserves subscription login for ordinary use of Claude Code and asks products and services to use API keys, and its recommended scripting mode needs an API key anyway. Max and Team plans now include monthly API credits, so the API route keeps the cost close to zero. See `planning-artifacts/research/technical-claude-cli-metadata-provider-2026-10-28/research.md`.
- **Key configuration:** provider and key from environment variables by default; an admin settings page can override them, with the key stored encrypted, masked in the UI, and never logged.
- **Stage 2:**
  - CLI providers only if their terms allow backend use.
  - Cloud API with a user-supplied key: Gemini Flash first. Gemini's free tier may use submitted data, which matters once real agency images are used.
  - Local: Gemma 4 12B via Ollama (accepts image input). Heavy for an examiner's machine, so never a requirement to run the app.
- **Fallback:** in v1, failure means empty fields that staff fill in by hand — not a chain of providers.

## Runnability and test data

- The mock provider is the default, so the app runs from the README without an API key, subscription, or local model.
- Seeded test users: one admin and two clients, so the access rules can be demonstrated (client A vs client B).
- A set of freely licensed sample images is committed to the repo, with their license source noted.
- The agency's real images and client data never enter the repository. The upload storage folder, `.env`, and any API keys are excluded from git; configuration is documented in `.env.example`.

## Duplicate detection

- **v1 — exact match:** a cryptographic hash of the stored original file. A byte-identical upload is rejected with a message pointing to the existing image. Because files are never modified after upload (see Metadata handling), the hash stays valid.
- **v1 — filename match:** a warning only, never a rejection. With exact hashing it only flags different files that share a name (for example `IMG_0001.jpg` from two cameras).
- **Stage 2 — near-duplicates:** a perceptual hash catches re-exports and minor edits of the same source image. Hash algorithm and threshold are architecture-stage decisions.

## Versioning

Staff need to upload a new version of an *existing* asset (for example, a retouched image) without creating an unrelated new record — the asset's identity, and any existing links, licenses, or purchase history tied to it, should persist across versions.

v1 models the asset and its file versions separately from day one (purchases point at the asset), even if only one version per asset is ever created. The upload-new-version feature is a stretch goal. Whether old versions remain individually browsable and downloadable, or only the latest is exposed with older ones kept for audit, is an open question for the PRD and architecture stage.

## v1 accommodations for later stages

Rule: a deferred feature gets a v1 accommodation only if it is a field, a relation, or a convention that is free at the start and expensive to retrofit — never a feature or an abstraction layer.

| Later feature | v1 accommodation |
|---|---|
| Versioning | Asset and file version modeled separately |
| Tripletex invoicing | Licence stores organisation, contact, asset, licence type, price at time of purchase, timestamp |
| Norwegian language pack | All UI strings in a translation file; English is the base |
| More AI providers, video | One AI provider interface; a media-type field on the asset; asset table not named "image" |
| Map view | GPS stored as latitude/longitude fields |
| More internal roles | A `role` field on users, not an `is_admin` flag |
| Multi-tenant | `tenant_id` on top-level tables only; no tenant-scoping layer |

Everything else on the stage-2 and later lists (near-duplicates, backup, branding, visual search) is purely additive and needs nothing in v1.

## Tripletex integration (stage 2)

- Tripletex has a real, documented REST API (`POST /v2/invoice`, plus customer/order endpoints — "customer" is Tripletex's own object name) — this is a well-trodden integration path; several existing Norwegian SaaS products (Opter, RecMan, Centra, Make.com/Zwapgrid connectors) follow the same shape: sync/create the client as a customer record in Tripletex, then create an invoice referencing it.
- Auth is proprietary, not OAuth2: a consumer token and an employee token exchange for a session token, which is then used as the password in HTTP Basic auth.
- The intended flow is a monthly batch job: sum each client's outstanding purchase balance from the purchase log, then post it to Tripletex to generate an invoice. Because each purchase already stores client, asset, price at time of purchase, and timestamp, this is a read-and-post job later, not a data-model rework.

## Single-tenant → multi-tenant path

v1 is single-tenant. Following the teacher's feedback, preparation stops at a `tenant_id` field on the top-level tables, defaulting to the one tenant; there is no tenant-scoping layer in v1. A later multi-tenant conversion is therefore real work — every query has to be scoped by tenant — and should be planned as its own project:

- Resolve tenant scoping through one shared repository/ORM-level abstraction rather than ad hoc `WHERE tenant_id = X` filters sprinkled through business logic.
- Typical trajectory: shared database and shared schema first (cheapest to run), moving to schema-per-tenant or database-per-tenant only if a specific tenant's isolation or compliance needs demand it.

## Discovery corrections worth remembering downstream

- The access model went through one real correction during discovery: an initial three-category split (internal-only / owned-free / stock-pool) was collapsed into two independent attributes (visibility × price) once it was pointed out that "owned/free" is just a special case of "restricted + free," not a distinct category. Downstream documents should use the two-attribute model, not the three-category one.
- Metadata edits are written on export, not into the stored file (see Metadata handling).
- A "purchase" is really a licence (2026-10-28). Free downloads also create a licence at 0 kr, so what a client has received is never taken away by a later change of visibility or price; only the revoke action removes it.
- The real AI provider changed from the Claude Code CLI to the Claude API (2026-10-28), after research into Anthropic's terms.
