# Session 2026-11-23: Story 1.5 – uploaded images get AI metadata from the mock provider

- **Story/task:** Story 1.5 ([spec](../../../_bmad-output/implementation-artifacts/spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md))
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (15:19–15:43)
- **Transcript:** [transcripts/2026-11-23-e402fdcd.md](../transcripts/2026-11-23-e402fdcd.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/975-2026-11-23-15-44-45-1-5-ai-metadata-mock-provider.md](../../../.logs/marthekalland3/975-2026-11-23-15-44-45-1-5-ai-metadata-mock-provider.md)
- **Branch and PR:** `story/1.5-ai-metadata-mock-provider`, #57 (open)
- **Commits:**
  - `d0507d0` feat(ai): mock provider generates image metadata after each upload [S-1.5]
  - `818add0` docs(story): story 1.5 spec, README, sprint status and deferred work [S-1.5]
  - `d01298f` Logg: 1.5 AI metadata from the mock provider

Workflow: `/bmad-build story 1.5`. Claude wrote the spec, asked two questions, and after approval a fresh subagent implemented it. Three review subagents (blind, edge case, verification gap) reviewed the diff; Claude triaged their 30 findings and sent 11 patches back to the implementer. Claude re-ran the full test suite itself after implementation and after the patches.

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Failed row on the Upload page: tag only, tag with a generic message, or tag with all seven reasons (recommended: tag only) | Accepted: tag only (D-061) | Story 3.2 owns the per-category reasons |
| Keep the spec (~2,800 tokens) as one spec rather than splitting it | Accepted | Schema, ai module, AI input, generation and UI depend on each other |
| The file name goes to the provider as its own field, not in the metadata text; the AI input is made in memory and never stored | Accepted (spec approved unchanged, D-060) | The mock needs the file name; a real model should not get it |
| Three review layers raised 30 findings | 11 patched, 1 deferred, 18 rejected (triaged by Claude; verdicts in the spec's Review Triage Log) | Rejected findings were unreachable now, already decided (e.g. D-061, AD-22's `fail` match), or for later stories (timeout → 3.5, output limits → 3.8) |

The user made no corrections or rejections this session; both questions were answered with the recommended option and the spec was approved unchanged.

## Bugs found in AI-generated code
All found by the review subagents in the triage, fixed by the implementation subagent, and verified by a full test run (205 Vitest, 62 Playwright):
- The startup sweep compared a lease set with the database clock against the app clock.
- AI text consisting only of control characters passed validation and was saved as an empty field with source `ai`.
- Embedded metadata went into the prompt unfenced, so a multiline description could add fake labelled lines.
- The test Compose env did not pin `MOCK_FAIL`, so a local `.env` with `MOCK_FAIL=true` would break the Ready tests.
- README and `.env.example` still offered `AI_PROVIDER=claude`, which fails every image until 3.5.
- Provider and fixture lookups resolved `Object.prototype` keys; the AI keyword insert could hit the unique index on rare Unicode.
- Two test gaps: control-character stripping of AI output, and the unexpected-error path in `generateMetadata`.

## Decisions
- [D-060](../decisions.md#d-060-the-ai-provider-port-carries-the-file-name-as-its-own-field-and-the-ai-input-is-made-in-memory)
- [D-061](../decisions.md#d-061-a-failed-upload-row-shows-the-failed-tag-only-until-story-32)
