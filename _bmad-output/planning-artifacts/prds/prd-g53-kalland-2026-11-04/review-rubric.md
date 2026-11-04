# PRD Quality Review: CRM-DAM (prd-g53-kalland-2026-11-04)

Calibration: solo, graded course project with the agency's real rollout counted in the stakes. Chain-top: it feeds UX, architecture and stories. v1 must run by 2026-12-05.

**Limit of this review:** the author of the draft walked the rubric inline, in the same session. It is a disciplined self-review and not an independent one.

## Overall verdict

The access rules, edge cases and rollout conditions are specific enough to build and test from, and the trade-offs are stated honestly. The largest remaining risk is size: v1 grew again after the teacher asked for it to shrink, the hours are not re-estimated, and the [v1] FRs have no order among themselves. Three other high findings were autofixed.

## Decision-readiness: adequate

Decisions are stated as decisions, and Trade-offs names what each gives up. The checkpoint in Release Stages gives a date and a consequence. What is missing is the consequence of the spine finishing late: "[v1] FRs are built only once the spine runs" does not say which come first when time runs out.

### Findings
- **high H1** No order among the [v1] FRs, and no hours estimate (§ Release Stages, Open Question 1). 14 FRs are tagged [v1], and only FR-31, FR-38, FR-39 and FR-42 state a fallback. The 45–65 h estimate predates D-022, available hours per week are unknown, and about 4.5 weeks remain with UX and architecture not started. *Fix:* rank them at epics and stories, against an actual estimate. Deferred to sprint planning, stated in Open Question 1.

## Substance over theater: strong

The two named protagonists drive FRs, the NFRs have thresholds, and the counter-measures are real. The Rollout Gate rests on sources whose confidence is stated.

## Strategic coherence: strong

The thesis (one access model on one backbone) is stated, SC-1 tests it, and SC-4 tests the self-serve claim. RG-14 is honest that the time-saving claim can only be shown after a baseline.

## Done-ness clarity: adequate after fixes

Most FRs have testable sub-bullets. The Document Purpose says tests trace to SC IDs, yet several FRs had no criterion.

### Findings
- **high H2** FR-12 could leak location to the provider (§ FR-12). "A resized copy" did not say it carries no embedded metadata, so GPS could reach the provider with the setting off. The "on" case no longer said that the provider receives the derived place name. *Fix:* applied.
- **high H3** FRs with no success criterion (§ Success Criteria). FR-1 to FR-4, FR-7, FR-20 and FR-37 to FR-40 traced to nothing. *Fix:* applied, SC-12.
- **medium** FR-11 did not read embedded alt text, although it is one of the agency fields. *Fix:* applied.
- **medium** Text from files and from the AI reaches pages with no stated handling (§ NFR-2). *Fix:* applied, treated as untrusted.
- **low** FR-38's "since the contact's last login or in the last 30 days" did not say which applies. *Fix:* applied.

## Scope honesty: adequate after fixes

Out of Scope is explicit, and the Rollout Gate states what v1 does not solve. The brief's other stage 2 items were silent.

### Findings
- **medium** The brief's stage 2 and later items were neither kept nor dropped (§ Release Stages). *Fix:* applied.
- **low** No self-service password change or reset was stated as out of scope, and RG-1 removes seeded users without saying how the first staff user is created. *Fix:* applied.

Open items: 5 Open Questions, none blocking UX or architecture.

## Downstream usability: adequate after fixes

The glossary is strong and the IDs are contiguous.

### Findings
- **high H4** The ID prefix "A" meant two things (§ access table, Assumptions Index). "A1" was both an access-table row and the checkpoint assumption, and SC-1 refers to "A1–A13". *Fix:* applied. The inline tags are removed now that the assumptions are settled, and the list moved to the addendum as AS-1 to AS-22.
- **medium** "Location data" was used throughout but not defined in the Glossary. *Fix:* applied.
- **medium** NFR-1's sample images had no size bound (grading criterion 7). *Fix:* applied, from the project plan.

## Shape fit: strong

Multi-stakeholder B2B with real UX, so journeys earn their place. The length is justified by the access rules and the rollout stakes, and the depth went to the addendum.

## Mechanical notes

- FR, NFR, SC, RG and UJ IDs are contiguous and unique, and cross-references resolve.
- FR-42's action list lacked discarding a draft; fixed.
- FR-5 said "contact" where deactivated staff are refused too; fixed.

## Counts

0 critical, 4 high (3 applied, 1 deferred with an owner), 5 medium (all applied), 4 low (all applied).
