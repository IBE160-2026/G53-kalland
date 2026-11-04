# Session 2026-11-04: prd-legal-update

- **Story/task:** – (planning work ahead of the epics and stories)
- **Prompts:** [prompts/2026-11-04.md](../prompts/2026-11-04.md) (09:51–10:00)
- **Transcript:** [transcripts/2026-11-04-d8c2e392.md](../transcripts/2026-11-04-d8c2e392.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/989-2026-11-04-10-01-50-prd-legal-update.md](../../../.logs/marthekalland3/989-2026-11-04-10-01-50-prd-legal-update.md)
- **Branch and PR:** `docs/prd-legal-update`, #34 (open)
- **Commits:**
  - `4184767` docs(prd): apply the legal research and D-024 to the PRD
  - `08d3301` Logg: prd-legal-update

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| V-1: block recognising people from appearance, but allow names written in the image or given in metadata, narrowing the report's "not to identify anyone" | Accepted | Staff can still search on those names, as in prompt v2 |
| RG-4: keep required records unchanged for their retention period, then anonymise | Accepted | Immediate anonymising conflicts with keeping invoices in their original format |
| Keep the checks D-024 defers in the rollout gate | Accepted | Nothing in the gate is built for v1, and management can still accept skipping them |
| RG-9: management explicitly accepts the alt-text exception before rollout | Accepted | FR-19 stays as D-024 decided, and the legal cost becomes a stated choice |
| Claude's own calls: prompt v3, conditional WCAG 2.0 wording, RG-5 block limited to images whose subject is a person | Flagged for review; the user made no changes | Not explicitly decided by the user |

The user rejected no suggestion this session. Claude wrote the changes and did the final check inline, so it was not an independent review, and no separate Validate was run.

## Bugs found in AI-generated code
None. No code changed. Claude's own check of the first edit found that RG-4 had dropped the rule that other licence records stay valid, and that the addendum named both prompt v2 and v3 as v1's prompt. Both were fixed before the commit.

## Decisions
- [D-025](../decisions.md): apply the legal research to the PRD, with four resolved conflicts
