// The single tenant of v1. Every top-level table carries tenantId; there is no scoping layer yet (NFR-9).
// The migration 0001_default-tenant inserts this row.
export const DEFAULT_TENANT_ID = "019ab0c0-0000-7000-8000-000000000001";
