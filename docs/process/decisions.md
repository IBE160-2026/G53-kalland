# Decision log

Important choices about technology, architecture, scope and way of working. New decisions are added at the bottom with the next free number. A decision that is replaced is marked **Status: Superseded by D-xxx** – it is not deleted. Entries up to D-007 were written in Norwegian before D-008 and are kept as recorded.

Template:

```markdown
## D-xxx: <short title>
- **Date:** YYYY-MM-DD
- **Status:** Accepted | Open | Superseded by D-xxx
- **Context:** Why did we have to decide something?
- **Alternatives:** What did we consider?
- **Decision:** What did we choose?
- **Rationale:** Why?
- **Consequences:** What does it mean going forward?
- **Trace:** commit/PR/story/session log
```

---

## D-001: BMad Method for planlegging
- **Dato:** 2026-09-11
- **Status:** Vedtatt
- **Kontekst:** Emnet forventer planleggingsdokumenter fra BMAD (brief, PRD, arkitektur, epics og stories) som sensor bruker for å spore koden tilbake til plan.
- **Beslutning:** BMad er installert i `_bmad/` med skills i `.claude/skills/`. Artefakter lagres i `_bmad-output/`.
- **Konsekvenser:** Planleggingsdokumenter oppdateres når planen endres, ikke bare ved oppstart.
- **Spor:** commit `176a867`

## D-002: Automatisk promptlogging via hook, committet med maskering
- **Dato:** 2026-10-15
- **Status:** Vedtatt
- **Kontekst:** Kriterium 1 krever lagrede prompts og KI-økter som kan knyttes til konkrete endringer.
- **Alternativer:** (a) Manuell kopiering av prompts. (b) Hook som logger lokalt (gitignoret), kun kuraterte øktlogger committes. (c) Hook som logger til repoet, med maskering av hemmeligheter.
- **Beslutning:** (c). En `UserPromptSubmit`-hook (`.claude/hooks/log-prompt.py`) skriver hver prompt til `docs/process/prompts/YYYY-MM-DD.md`. `/log-session` lager kuraterte øktoppsummeringer i `docs/process/sessions/`.
- **Begrunnelse:** Fullstendige, automatiske logger er sterkere bevis enn manuelle utdrag og glemmes ikke. Python i stedet for jq fordi det kjører likt på flere maskiner.
- **Konsekvenser:** Promptloggen committes sammen med arbeidet den hører til. Hooken fanger bare prompts, ikke svar; svar, korrigeringer og avvisninger dokumenteres med `/log-session`. Ikke lim inn ekte hemmeligheter i prompts selv om maskering finnes.
- **Spor:** branch `chore/process-setup`, [øktlogg 2026-10-15](sessions/2026-10-15-prosessoppsett.md)
- **Oppdatert 2026-10-16:** Utvidet av D-007. Claudes svar fanges nå også, i transkripsjoner, og `/log-session` er erstattet av `/wrap-up`.

## D-003: Norsk prosessdokumentasjon, engelske BMad-artefakter
- **Dato:** 2026-10-15
- **Status:** Superseded by D-008
- **Kontekst:** README og emnet er på norsk; BMad er konfigurert med `document_output_language = "English"`.
- **Beslutning:** `README.md`, `CLAUDE.md` og `docs/process/` skrives på norsk. BMad-artefakter i `_bmad-output/` forblir på engelsk.
- **Spor:** `_bmad/config.toml`

## D-004: Sensorveiledningen versjoneres ikke – sammendrag i stedet
- **Dato:** 2026-10-15
- **Status:** Vedtatt
- **Kontekst:** Sensorveiledningen (PDF) er emnemateriell, ikke gruppens arbeid.
- **Beslutning:** PDF-en ligger lokalt som `docs/process/sensorveiledning-ibe160-del1.pdf` og er gitignoret. Repoet inneholder i stedet sammendraget [`vurderingskriterier.md`](vurderingskriterier.md).
- **Konsekvenser:** Sammendraget må oppdateres hvis faglærer publiserer en ny versjon.

## D-005: Branch og pull request for alt arbeid, også som soloprosjekt
- **Dato:** 2026-10-15
- **Status:** Vedtatt
- **Kontekst:** Kriterium 1 og 3 ser etter branches, PR-er og spor av kodegjennomgang. Prosjektet har ett medlem.
- **Beslutning:** Hver story/oppgave får egen branch (`story/<id>-<slug>`, `chore/<slug>`, `fix/<slug>`) og merges via PR med en kort gjennomgangsnotat, også når det ikke finnes en annen reviewer.
- **Begrunnelse:** Gjør historikken lesbar per oppgave og gir et naturlig sted å dokumentere gjennomgang av KI-generert kode.

## D-006: Avgrensning av V1
- **Dato:** 2026-10-15
- **Status:** Superseded by D-009
- **Kontekst:** Tilbakemeldingen på product brief (`_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/tilbakemelding-product-brief.md`) sier at V1 er stor for én person, at KI-metadata trenger testmodus/mock så sensor kan kjøre appen uten vår API-nøkkel, og at to suksesskriterier ikke er testbare.
- **Beslutning:** Ikke tatt ennå. Må avklares før PRD og arkitektur.

## D-007: Transkripsjoner per økt og `/wrap-up` som fast øktslutt
- **Dato:** 2026-10-16
- **Status:** Vedtatt
- **Kontekst:** Promptloggen (D-002) viser bare hva vi spurte om, ikke hva KI svarte. Kriterium 1 ser etter eksempler på at KI-forslag ble rettet eller avvist, og det sees best i selve samtalen. Avslutningen av en økt var dessuten flere manuelle steg som lett glemmes.
- **Alternativer:** (a) Bare kuraterte øktlogger, som før. (b) Committe rå JSONL-transkripsjoner. (c) Gjøre transkripsjonen om til markdown med bare bruker- og Claude-tekst, maskert.
- **Beslutning:** (c). `.claude/hooks/transcript-to-md.py` skriver `docs/process/transcripts/<dato for første melding>-<økt-ID>.md`. `/wrap-up` erstatter `/log-session`: den lager transkripsjonen, skriver øktloggen med lenke til den, oppdaterer beslutningsloggen, scanner prosessfilene for hemmeligheter og stopper ved treff, og committer og pusher prosessfilene. På `main` lager den en `docs/`-branch og PR. Maskeringen er flyttet til `.claude/hooks/redact.py`, så promptlogg, transkripsjoner og scan bruker de samme mønstrene. En `SessionEnd`-hook er sikkerhetsnett: den skriver transkripsjonen bare hvis `/wrap-up` ikke har laget den.
- **Begrunnelse:** Rå JSONL er uleselig for sensor og inneholder verktøyresultater med filinnhold. Verktøykall og thinking utelates fordi det viktige for sporbarheten er dialogen og vurderingene; commits viser hva som faktisk ble endret. Transkripsjonen lages inne i `/wrap-up`, fordi SessionEnd kjører først etter at `/wrap-up` har committet. Først lot vi hooken overskrive filen med de siste meldingene, men det ville gitt en ucommittet fil ved hver øktstart som neste `/wrap-up` committet på en tilfeldig branch, f.eks. en story-branch. Derfor overskriver hooken ikke.
- **Konsekvenser:** Repoet er offentlig, så alt som skrives i en økt blir publisert; maskering fanger kjente nøkkelformater, men ikke alt. Meldingene etter `/wrap-up` (godkjenning og commit-rapport) kommer ikke med i transkripsjonen; committen viser utfallet. Transkripsjonsformatet er ikke et dokumentert API, så scriptet har tester med en syntetisk fixture (`.claude/hooks/tests/`). Tidligere økter får ikke transkripsjoner i ettertid; logger skal ikke etterkonstrueres.
- **Spor:** branch `chore/session-transcripts`

## D-008: English as the working language of the repo
- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** D-003 split the repo into Norwegian process docs and English BMad artifacts, so the same project was documented in two languages and the commands, CLAUDE.md and hooks mixed both. Some sources are external and Norwegian: the teacher's feedback on the product brief and the grading guide (summarized in `vurderingskriterier.md`).
- **Alternatives:** (a) Keep D-003. (b) Translate everything, including external sources and historical logs. (c) English for everything we write; keep external Norwegian originals unchanged with an English translation next to them; leave historical logs as they are.
- **Decision:** (c). All docs, code, comments and commit messages are written in English. External Norwegian sources keep their original and get a translation as `<name>.en.md` (`docs/process/vurderingskriterier.en.md`, `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/tilbakemelding-product-brief.en.md`); CLAUDE.md and the commands point to the English versions. Prompt logs, session logs and transcripts written before this decision, and decision entries D-001–D-007, are not translated. The app's Norwegian UI strings and language packs are product content and are not covered.
- **Rationale:** One working language makes the repo consistent for Claude and readers, and matches the BMad output language. Originals of external sources are evidence of what we were actually told, so they are not edited; the translation is a convenience, and the original wins if they differ. Historical logs are process evidence and must not be rewritten afterwards (see D-007).
- **Consequences:** The hooks now write English headings: the prompt log marks sessions as ``session `xxxxxxxx` `` instead of ``økt `xxxxxxxx` ``, and `/wrap-up` accepts both when finding the session ID. The redaction mask stays `[MASKERT]` so the secret scan treats already-masked lines in older logs as clean, and the `passord` pattern stays because prompts may still contain Norwegian. The translations must be updated if the originals change.
- **Trace:** branch `chore/english-only`

## D-009: V1 scope after feedback on the product brief
- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Resolves D-006. The teacher's feedback (`_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/tilbakemelding-product-brief.en.md`) said v1 was too large for one person, that the AI metadata had no plan for running without our key, and that two success criteria could not be tested.
- **Alternatives:** (a) Keep the September scope. (b) Narrow v1 to the core flow and push everything else to later stages without regard for the data model. (c) Narrow v1 to the core flow, but let deferred features shape the v1 data model where retrofitting would force a rewrite.
- **Decision:** (c). v1 (December 2026) is the course deliverable on sample data, not the agency's production rollout: client register, upload with embedded metadata and AI metadata (all fields editable), exact-hash duplicate rejection with a filename warning, visibility × price, client dashboard with search, small unwatermarked previews of paid images, downloads and logged purchases. Versioning is a stretch goal; the data model supports it from day one. Stage 2: near-duplicates, backup, tenant and client branding, map view, more AI providers, Tripletex, Norwegian language pack. A deferred feature gets a v1 accommodation only if it is a field, a relation, or a convention that is free at the start and expensive to retrofit. The success criteria were replaced with seven checkable ones.
- **Rationale:** A stable core flow scores better than a large, half-finished one, and the agency's real rollout does not depend on the course deadline. The accommodation rule answers the wish to avoid rewrites without building speculative features.
- **Consequences:** Backup and filename-based rejection (September decisions) are reversed; this is logged as overrides in the brief's `.memlog.md`. The PRD builds on the revised brief and addendum. "Can be extended without a rewrite" is a design constraint, not a success criterion.
- **Trace:** issue #7, branch `docs/product-brief-feedback`, `brief.md` and `addendum.md` in the brief folder

## D-010: AI providers for image metadata
- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** The feedback asked which language model creates the metadata, what it costs, and how the examiner runs the app without our key.
- **Alternatives:** Cloud API (Gemini Flash), CLI tools (Claude Code, Codex, Gemini CLI), a local model via Ollama (Gemma 4 12B), and a mock. Building all three real families with fallback in v1 was considered and rejected as too much scope.
- **Decision:** One provider interface. v1 ships a mock provider (default for tests and the examiner) and the Claude Code CLI as the real provider. Codex and Gemini CLI, cloud APIs with a user-supplied key (Gemini Flash first) and a local Ollama model (Gemma 4 12B) come in stage 2. In v1, an AI failure leaves empty fields for manual editing; there is no fallback chain.
- **Rationale:** The agency already pays for Claude Code and Codex, so the CLI is the cheapest real provider for the agency. The mock makes the app runnable and testable without a key, subscription or local model.
- **Consequences:** The server needs the Claude Code CLI installed and logged in to use the real provider. Gemini's free tier may use submitted data, which must be considered before real agency images go through it.
- **Trace:** issue #7, `addendum.md` section "AI providers"

## D-011: Metadata is written into files on export, and GPS is stripped for clients
- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Embedded metadata (EXIF, IPTC, XMP) can be wrong, and corrections must reach the image file itself. Writing edits into the stored file would change its hash on every edit.
- **Alternatives:** (a) Write on edit: change the stored file, and hash only the pixel data for duplicate detection. (b) Write on export: keep the stored original unchanged, use the database as the source of truth, and write current metadata into the copy that is downloaded.
- **Decision:** (b). GPS is kept internally (for a later map view) and stripped from every copy a client downloads.
- **Rationale:** The file hash stays stable, so exact duplicate detection keeps working, and a metadata edit does not blur what a file version is. Clients' copies do not reveal where, for example, a portrait was taken.
- **Consequences:** The stored file does not reflect current metadata; downstream documents must not assume it does. Export needs a metadata-writing step and a test that downloaded files carry edits and no GPS.
- **Trace:** issue #7, `addendum.md` section "Metadata handling"

## D-012: Automatic repo hygiene for issues and branches
- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Issue #4 stayed open after PR #5 resolved it, because the PR did not reference the issue. Merged branches were also left behind locally and on GitHub.
- **Alternatives:** (a) Manual clean-up sessions now and then. (b) Let GitHub and git do it: closing keywords in PRs, auto-delete of head branches on merge, and `fetch.prune`.
- **Decision:** (b). PRs that resolve an issue say `Closes #<n>`. The repo setting "Automatically delete head branches" is on. Locally, `fetch.prune` is on, and local branches whose remote is gone are deleted after pulling `main` (command in `CLAUDE.md`).
- **Rationale:** Issues and branches stay in sync with what is merged, with no extra manual step to forget.
- **Consequences:** A merged branch is gone from GitHub straight away. Work that continues after a merge goes on a new branch.
- **Trace:** issue #4, PR #5, branch `chore/repo-cleanup`
