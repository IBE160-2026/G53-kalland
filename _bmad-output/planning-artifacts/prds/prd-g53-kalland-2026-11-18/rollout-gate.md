---
title: "Rollout Gate: CRM-DAM"
status: final
created: 2026-11-18
updated: 2026-11-18
---

# Rollout Gate: CRM-DAM

What must be true before the agency uses CRM-DAM with real images and client data. It belongs to [the PRD](prd.md) (stage 2 in its Release Stages) and was moved out of it on 2026-11-18, following the teacher's feedback (point 4.2), so the PRD can show what v1 must finish. The PRD keeps one line per item with its owner. The requirement IDs below (FR, NFR) refer to the PRD.

Nothing here is built for v1. Each item must be met, or explicitly accepted by the agency's management, before real images or client data enter the system. The legal items need checking by someone competent; this PRD is not legal advice, and the [legal research](../../research/domain-ai-images-privacy-accessibility-legal-2026-11-04/research.md) records what was and wasn't verified.

- **RG-1 Hosting.** The app runs on managed hosting over HTTPS, with no seeded users, a stated way to create the first staff user, and secrets outside the code. The agency chooses where it is hosted, with EU/EEA as the default. Staff login gets a decision on two-factor authentication, and the login delay from NFR-2b is in place.
- **RG-2 Backups.** Database and files are backed up on a schedule agreed with the agency, and a restore has been tested.
- **RG-3 Data protection basis.** The agency has recorded its legal basis, its role for each data set and its processing activities (an Art. 30 record), given contacts a privacy notice, and signed data processing agreements with the hosting and AI providers.
  - A data protection impact assessment (DPIA) screening is documented. A full DPIA is expected if children's images stay in scope.
  - Transfers to the US rest on the standard contractual clauses in the AI provider's data processing agreement, since Anthropic was not found on the Data Privacy Framework list. A transfer assessment covers *Trump v. Slaughter*, and there is a plan if transfers stop.
  - Anthropic is asked how its agreement applies to a Norwegian exporter, and which of its retention statements is right.
  - The privacy notice states Anthropic's retention: 30 days for API inputs and outputs until Anthropic confirms otherwise, and up to 2 years for flagged content.
- **RG-4 Erasure.** Staff can permanently delete an image with its files, and remove a person's data on request. This resolves the conflict between v1's "never delete" rule and data protection rights.
  - Records the law requires stay unchanged for their retention period, 5 years after the financial year ends: invoices in their original format, and licence agreements when invoices refer to them. The person's details are anonymised when the period ends. Other licence records stay valid with the details anonymised at once.
  - Each recipient of the data is told about the erasure (GDPR Art. 19), unless that is impossible or disproportionate.
- **RG-5 People in images.** For each image, staff record whether a person is the subject, a person is incidental, or no person appears, and they record the scope and duration of any consent. Identifiable means more than a visible face: clothing, hair and context can identify someone. An image whose subject is an identifiable person, with no consent covering commercial licensing, cannot be licensed to clients who did not commission it.
  - A commissioned portrait also needs the commissioner's consent (åndsverkloven § 105).
  - One legal basis is chosen in advance for each purpose, including how incidental people are treated.
  - Images of children have their own consent check. A legally competent reviewer decides whether both guardians must sign, and whether children's images may be licensed commercially at all.
- **RG-6 Rights and licence terms.** The licence text is reviewed and available in Norwegian. The agency confirms it may license each image set it loads, including commissioned work and photographers' rights. One rights record per image set can cover both this item and RG-5.
  - Photographer agreements expressly permit sending images to AI providers. Anthropic's terms make the customer warrant it holds those rights, and its indemnity excludes claims caused by inputs.
  - Licence terms state what happens if consent is withdrawn, and the agency decides how that fits [FR-24 and FR-25](prd.md#f3-access-and-licences).
  - Nothing promises exclusive rights in AI metadata.
  - A legally competent reviewer looks at withdrawal of consent after a licence sale, and at AI upload of photographers' images.
- **RG-7 Billing.** A way to bill recorded licences exists (Tripletex or an export), with currency and VAT settled. v1's USD price is a placeholder until then.
- **RG-8 Norwegian.** The Norwegian UI pack is in place, and Norwegian AI metadata is re-tested and accepted by the agency, including the unfilled scores in the pilot results.
- **RG-9 Accessibility.** The app meets NFR-5a whether or not the law covers the client portal. Where the universal-design rules apply to a private business, the legal minimum is WCAG 2.0 level A and AA, so NFR-5a's WCAG 2.1 target goes beyond it. Whether they cover an invitation-only B2B portal is unresolved (D-024). The agency keeps a compliance record (§ 5 of the universal-design regulation). Its management explicitly accepts NFR-5a's known exception, knowing that an image published without real alt text would fail WCAG 1.1.1 if the portal is covered.
- **RG-10 Scale and migration.** The real library is expected to hold 5,000–50,000 images.
  - Search is re-tested at 50,000 images against a target agreed with the agency.
  - Storage is planned for up to about 2.5 TB at the 50 MB limit.
  - A bulk import exists, since the 50–100 image upload flow doesn't suit this volume. It handles the existing library's duplicates and repeated camera filenames without a manual decision per file.
- **RG-11 File types.** The file types staff really use (for example RAW, TIFF, PSD and HEIC) are confirmed with the agency and either supported or handled by a stated routine.
- **RG-12 Email and accounts.** Setup links and resets are sent by email.
- **RG-13 Operations.** A named role owns updates, monitoring, support and the response to a data breach, including the 72-hour notification duty.
- **RG-14 Baseline.** The time staff take to find an image, and the number of image requests clients send by email, are measured before rollout, so the benefit can be shown afterwards. Targets are agreed with the agency.
- **RG-15 Market scope.** The agency decides whether the portal serves EU clients. If it does, the AI Act (including provider status and Art. 50(2)) and the European Accessibility Act are re-checked.
- **RG-16 AI governance.** A named owner watches the Norwegian AI Act bill and Prop. 41 LS, and re-checks both before this gate is signed off. Staff get a short note on AI literacy and on what must not be described in metadata.

## Questions for the agency

Exact library size, file types in use, which images show people, hosting preference and which Claude plan it has. Owner: Marthe; revisit before stage 2 planning. (Moved from the PRD's Open Questions on 2026-11-18.)
