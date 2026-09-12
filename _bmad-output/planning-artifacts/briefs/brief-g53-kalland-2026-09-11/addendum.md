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

## Duplicate detection

Two checks at ingestion, per discovery conversation:

- **File hashing** — exact- or near-duplicate content matching (for example, a cryptographic hash for exact duplicates and a perceptual hash for near-duplicates such as re-exports or minor edits of the same source image) catches re-uploads even when the filename differs.
- **Filename matching** — a cheap first-pass signal, useful alongside hashing rather than instead of it.

Exact hashing algorithm and near-duplicate threshold are architecture-stage decisions, not brief-level ones.

## Versioning

Staff need to upload a new version of an *existing* asset (for example, a retouched image) without creating an unrelated new record — the asset's identity, and any existing links, licenses, or purchase history tied to it, should persist across versions. Whether old versions remain individually browsable and downloadable, or only the latest version is exposed with older ones kept for audit purposes, is an open question for the PRD and architecture stage — the brief only commits to "new-version-upload against an existing asset" as a capability.

## Tripletex integration (deferred, but architecture should leave room for it)

- Tripletex has a real, documented REST API (`POST /v2/invoice`, plus customer/order endpoints — "customer" is Tripletex's own object name) — this is a well-trodden integration path; several existing Norwegian SaaS products (Opter, RecMan, Centra, Make.com/Zwapgrid connectors) follow the same shape: sync/create the client as a customer record in Tripletex, then create an invoice referencing it.
- Auth is proprietary, not OAuth2: a consumer token and an employee token exchange for a session token, which is then used as the password in HTTP Basic auth.
- The intended flow (per discovery) is a monthly batch job: sum each client's outstanding purchase balance from the purchase log, then post it to Tripletex to generate an invoice. Since this is deferred past v1, the purchase-logging data model should carry enough detail (client, image, price, timestamp) now that this batch job is a read-and-post job later, not a data-model rework.

## Single-tenant → multi-tenant path

Standard guidance from SaaS architecture practice, applicable here even though v1 ships single-tenant:

- Treat `tenant_id` as a first-class field on every relevant table from day one, even while there is only ever one tenant row in v1.
- Resolve tenant scoping through a shared repository/ORM-level abstraction rather than ad hoc `WHERE tenant_id = X` filters sprinkled through business logic — this is what turns the later multi-tenant conversion into a migration instead of a rewrite.
- Typical trajectory if and when multi-tenant conversion happens: shared database and shared schema first (cheapest to run), moving to schema-per-tenant or database-per-tenant only if a specific tenant's isolation or compliance needs demand it.

## Discovery corrections worth remembering downstream

- The access model went through one real correction during discovery: an initial three-category split (internal-only / owned-free / stock-pool) was collapsed into two independent attributes (visibility × price) once it was pointed out that "owned/free" is just a special case of "restricted + free," not a distinct category. Downstream documents should use the two-attribute model, not the three-category one.
