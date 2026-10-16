---
title: "Product Brief: CRM-DAM"
status: final
created: 2026-09-11
updated: 2026-10-16
---

# Product Brief: CRM-DAM

## Executive Summary

CRM-DAM is a modular platform that starts by solving a real, daily problem at a working design agency: staff lose significant time hunting for images in the agency's own image bank because there is no proper system for organizing, tagging, and finding them. The same platform doubles as a gated, client-facing storefront — clients log into their own dashboard to view the images already licensed to them at no cost, and to browse and purchase from the agency's wider stock pool, without emailing the agency and waiting for a reply. It is built as modules on a CRM backbone (see Vision).

A solo student is building this for the IBE160 course. Version 1 (December 2026) is the course deliverable: the core flow, complete and tested, running on sample data. The agency's real rollout follows stage 2 (see Scope). v1 is therefore scoped to be finished and stable, with a data model that leaves room for what comes next.

## The Problem

Agency staff currently search an unstructured internal image bank with no reliable metadata, tagging, or duplicate control — every search is slower than it should be, and duplicate uploads make the problem worse over time. There is no baseline time-lost metric today, but the pain is well understood by the team living it daily.

Separately, when a client wants images — either the ones already shot or designed for them, or something from the agency's broader stock catalogue — the process today runs through manual requests to agency staff rather than self-serve access. This costs time on both sides and gives clients no visibility into what they're entitled to.

## Who This Serves

- **Primary — agency staff.** The team at the design agency where the student works. Need to find and reuse images fast, and control what each client can see and buy.
- **Secondary — agency clients.** Need self-serve access to the images already licensed to them, and an easy way to browse and buy additional stock images, without going through staff.
- **Future — other design agencies.** Not in scope; a possible multi-tenant SaaS version later (see Vision).

## The Solution

Staff upload an image once. The system reads all metadata already embedded in the file (EXIF, IPTC, XMP — including camera data and GPS location) and adds an AI-generated title, description, alt-text, and search keywords. Every field can be corrected by hand, because both the camera's data and the AI's suggestions are sometimes wrong. An upload never fails because the AI is unavailable; staff fill in the fields themselves. An identical file uploaded twice is rejected with a message pointing to the existing image; a different file that only shares a filename is let through with a warning.

Every image carries two independent attributes that together model the agency's real access needs without extra special-casing:

- **Visibility** — public to all clients, restricted to a specific client or list of clients, or internal-only (visible to no client).
- **Price** — free, or a one-time purchase (buy once, download and keep).

A client's own commissioned work is simply "restricted to that client + free." A general stock photo available to everyone for a fee is "public + paid." One model, no overlapping categories.

Clients log into their own dashboard, search (by keyword and metadata) the images visible to them, and download what's already theirs at no cost. Paid images appear as a small preview without a watermark; the original is downloadable after purchase. A purchase is a logged transaction, not a card payment — it is recorded with the price at the time of purchase and is visible to both the client and the agency, ready for later invoicing.

Files that leave the system always carry the current, corrected metadata, written into the downloaded copy. GPS location is stripped from files clients download; the agency keeps it for its own use.

## What Makes This Different

AI-generated metadata is genuinely useful here, but it is now standard practice among leading DAM tools (Canto, Bynder, Cloudinary) — it removes a real bottleneck for a small team, but it isn't a competitive moat and shouldn't be sold as one.

The actual differentiator is the combination: disciplined internal asset management, a gated client storefront, and an agency's own CRM and billing context, all on one modular backbone. Existing DAM products (Bynder, Brandfolder, Canto, Cloudinary DAM) solve internal search and permissions well, and stock platforms (Shutterstock-style) solve public storefronts well, but none offer this combination (see addendum for the comparables research). The same team that will use it daily is also building it, which keeps the scope honest rather than speculative.

## AI and Running Without a Key

Metadata generation sits behind one provider interface, so the AI service can be swapped without touching the rest of the app.

- **v1 ships two providers:** a **mock provider** that returns fixed, predictable metadata, and the **Claude Code CLI** as the real provider. The agency already has Claude Code and Codex at work, so the CLI is the cheapest way for the agency to use and test the app.
- **The mock is the default.** The automated tests use it, and an examiner can run the whole flow from the README without an API key, subscription, or local model.
- **Later providers** (stage 2) plug into the same interface: Codex and Gemini CLI, cloud APIs with the user's own key (starting with Gemini Flash), and a local model through Ollama (starting with Gemma 4 12B).

The repo contains seeded test users (one admin, two clients) and a set of freely licensed sample images. The agency's real images and client data never enter the repository; uploaded files and API keys are kept out of git.

## Success Criteria

1. **Access matrix.** Automated tests cover every combination of visibility (public / restricted / internal-only) × price (free / paid) and check what a client can see, download, and buy. Client A never sees an image restricted to client B, and no client sees an internal-only image.
2. **Duplicates.** Uploading a byte-identical file is rejected with a message pointing to the existing image. A different file with the same filename is accepted with a warning.
3. **End-to-end flow, runnable by the examiner.** Following the README, the full flow — staff upload, AI metadata, staff set visibility and price, a client views and downloads or buys, the purchase is logged — runs in mock mode with the seeded users and sample images, without an API key.
4. **Self-serve.** A client logs in, finds an image by keyword, downloads a free image licensed to them, and buys a paid one, with no action from staff.
5. **Purchase log.** Each purchase records client, image, price at the time of purchase, and timestamp, and appears in the client's purchase history and in the admin view.
6. **Correct files out.** A downloaded file carries the current, edited metadata and contains no GPS data.
7. **AI failure doesn't block.** If the AI provider fails or is unavailable, the upload still succeeds and the metadata can be filled in by hand.

## Scope

**In, for v1 (December 2026, solo build, tested with sample data at ~500 images and ~10 clients):**

- Client register (CRM backbone)
- Image upload: embedded metadata + AI title, description, alt-text, keywords; all fields editable
- AI providers: mock and Claude Code CLI
- Duplicates: exact hash rejects, filename match warns
- Access model: visibility × price
- Client dashboard: search, paid previews, downloads, purchases, purchase history
- Purchase log for client and agency (no payment processing)
- Downloads: current metadata, no GPS for clients
- Single "admin" role
- English UI with strings in a translation file
- Seeded test users and freely licensed sample images

**Stretch goal for v1:** uploading a new version of an existing image (for example, a retouched file) while keeping its identity and purchase history. The data model supports versions from day one; the feature itself is built only once the core flow is done, tested, and runnable from the README.

**Stage 2 — after the course, before the agency's real rollout:**

- Versioning, if not finished as the stretch goal
- Near-duplicate detection (perceptual hash)
- Regular backups of asset files and database
- Branding: the agency's logo and colors, and each client's logo or profile picture on their dashboard
- Map view for finding images by GPS location
- More AI providers (see AI and Running Without a Key)
- Tripletex invoicing: a monthly job that sums each client's purchases and creates an invoice
- Norwegian language pack on top of the English base

**Later:** video and other asset types, AI visual-similarity search, more internal roles, further modules (brand portals, proposal generator), multi-tenant SaaS.

v1 does not build any of these, but its data model avoids the choices that would force a rewrite later — for example, keeping an image's identity separate from its file versions, and storing the price on each purchase. The addendum lists these accommodations.

## Vision

In two to three years, CRM-DAM is the operational backbone for the agency's entire client and asset workflow: brand portals and a proposal generator run as additional modules on the same CRM base, and Tripletex and Norwegian support have long since shipped. If it has proven itself internally, the platform has also converted into a multi-tenant SaaS product serving other design agencies facing the same problem: too many images, too little time to find them.
