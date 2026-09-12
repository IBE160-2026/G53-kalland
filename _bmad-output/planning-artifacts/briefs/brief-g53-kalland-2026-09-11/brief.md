---
title: "Product Brief: CRM-DAM"
status: draft
created: 2026-09-11
updated: 2026-09-12
---

# Product Brief: CRM-DAM

## Executive Summary

CRM-DAM is a modular platform that starts by solving a real, daily problem at a working design agency: staff lose significant time hunting for images in the agency's own image bank because there is no proper system for organizing, tagging, and finding them. The same platform doubles as a gated, client-facing storefront — clients log into their own dashboard to view the images already licensed to them at no cost, and to browse and purchase from the agency's wider stock pool, without emailing the agency and waiting for a reply.

The system is built module-first on a CRM backbone, with DAM and Stock Sales as nested modules — the same architecture the roadmap builds on (see Vision).

A solo student is building this for the IBE160 course (deadline December 2026), but it's intended for real use at the agency afterward — so scope decisions here are made for a working tool, not a classroom demo.

## The Problem

Agency staff currently search an unstructured internal image bank with no reliable metadata, tagging, or duplicate control — every search is slower than it should be, and duplicate uploads make the problem worse over time. There is no baseline time-lost metric today, but the pain is well understood by the team living it daily.

Separately, when a client wants images — either the ones already shot or designed for them, or something from the agency's broader stock catalogue — the process today runs through manual requests to agency staff rather than self-serve access. This costs time on both sides and gives clients no visibility into what they're entitled to.

Existing DAM products (Bynder, Brandfolder, Canto, Cloudinary DAM) solve internal search and permissions well, and dedicated stock platforms solve public storefronts well — but none combine disciplined internal DAM search with a gated, per-client storefront rooted in the agency's own client relationships and billing. That combination is the actual gap (see addendum for the comparables research).

## Who This Serves

- **Primary — agency staff.** Currently the team at Marthe's design agency. Need to find and reuse assets fast, and control what each client can see and buy.
- **Secondary — agency clients.** Need self-serve access to the images already licensed to them, and an easy way to browse and buy additional stock images, without going through staff.
- **Future — other design agencies.** Not in scope for v1, but the single-tenant architecture is deliberately built so a multi-tenant SaaS version could serve other agencies with the same problem later.

## The Solution

CRM-DAM lets staff upload images once and get AI-generated title, description, alt-text, and search keywords automatically, on top of whatever metadata is already attached to the file. Duplicate uploads are caught at ingestion using file hashing and filename matching, so the bank doesn't accumulate redundant copies. Staff can upload a new version of an existing asset (for example, a retouched image) without losing that asset's identity or history.

Every image carries two independent attributes that together model the agency's real access needs without extra special-casing:

- **Visibility** — public to all clients, restricted to a specific client or list of clients, or internal-only (visible to no client).
- **Price** — free, or a one-time purchase (buy once, download and keep).

A client's own commissioned work is simply "restricted to that client + free." A general stock photo available to everyone for a fee is "public + paid." One model, no overlapping categories.

Clients get a branded dashboard — carrying the agency's logo and colors, plus the client's own logo or profile picture — where they can search (by keyword and metadata) the images visible to them, download what's already theirs at no cost, and purchase from the paid stock pool. Every purchase is logged and visible to both the client and the agency, giving both sides a clear record.

The whole system runs as a single-tenant deployment for v1, but is deliberately designed so that adding tenants later — additional agencies running their own instance of the same platform — is a migration, not a rewrite. Tenant is treated as a first-class concept in the data model from day one, even though only one tenant exists at launch.

## What Makes This Different

AI-generated metadata is genuinely useful here, but it is now standard practice among leading DAM tools (Canto, Bynder, Cloudinary) — it removes a real bottleneck for a small team, but it isn't a competitive moat and shouldn't be sold as one.

The actual differentiator is the combination: disciplined internal asset management, a gated client storefront, and an agency's own CRM and billing context, all on one modular backbone — a shape none of the comparable DAM or stock-photo products (Bynder, Brandfolder, Canto, Shutterstock-style platforms) offer together. The same team that will use it daily is also building it, which keeps the scope honest rather than speculative.

## Success Criteria

- Staff can locate a needed image meaningfully faster than the current ad hoc process (qualitative for now — no baseline exists yet to measure against).
- Duplicate uploads are reliably caught at ingestion rather than discovered later.
- A client can retrieve their own licensed images and purchase from the stock pool independently, without emailing staff.
- The full flow works end-to-end: staff upload an image, the system generates AI metadata, staff set its visibility and price, a client views it and downloads or purchases it, and the purchase is logged for both sides.
- The system is complete and defensible as an IBE160 deliverable by December 2026.
- Deferred features (Tripletex, Norwegian language pack, multi-tenant conversion) can be added later without reworking the core architecture.

## Scope

**In, for v1 (target: December 2026, solo build, tested at ~500 images and ~10 clients):**

- CRM backbone with client records
- DAM module: image upload, AI-generated title, description, alt-text, and keywords; manual metadata; keyword and metadata search; hash- and filename-based duplicate detection; new-version-upload for existing assets
- Per-image access model: visibility (public, restricted list, or internal-only) × price (free or one-time paid)
- Stock Sales sub-module: one-time purchase, buy-and-keep
- Client dashboard: search and browse available images, download owned images, purchase stock images, view own purchase history
- Tenant branding (logo, colors) and per-client branding (logo or profile picture on their dashboard)
- Purchase logging, visible to both client and agency
- Single internal "admin" role
- Regular backups of the full system (asset files and database)

**Explicitly out of v1, designed to be added without a rework:**

- Tripletex invoicing integration — purchases are logged in v1 but not yet sent to Tripletex; the monthly balance-to-invoice flow follows shortly after launch
- Norwegian language pack — English-only in v1; strings should be externalized so a language pack is additive later
- Video and other non-image asset types — the next planned asset type after images; will need a different AI metadata-generation approach and shouldn't be blocked by an image-only assumption in the ingestion pipeline
- AI visual-similarity search — keyword and metadata search only for v1
- Additional internal roles beyond a single admin — the role model should not assume admin will always be the only role
- Multi-tenant SaaS conversion — deferred; the architecture already accounts for it (see Solution and addendum)
- Additional modules (brand portals, proposal generator) — planned, not v1

## Vision

In two to three years, CRM-DAM is the operational backbone for the agency's entire client and asset workflow: brand portals and a proposal generator run as additional modules on the same CRM base, and Tripletex and Norwegian support have long since shipped. If it has proven itself internally, the platform has also converted into a multi-tenant SaaS product serving other design agencies facing the same problem: too many images, too little time to find them.
