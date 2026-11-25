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
- **Alternatives:** (a) Manual clean-up sessions now and then. (b) Let GitHub and git do it: closing keywords in PRs, the repo setting "Automatically delete head branches", and `fetch.prune`. (c) As (b), but a GitHub Actions workflow deletes the merged branch, since changing repo settings needs admin access, which the student account does not have (the API returns 404).
- **Decision:** (c). PRs that resolve an issue say `Closes #<n>`. `.github/workflows/delete-merged-branch.yml` deletes the head branch when a PR is merged. Locally, `fetch.prune` is on, and local branches whose remote is gone are deleted after pulling `main` (command in `CLAUDE.md`).
- **Rationale:** Issues and branches stay in sync with what is merged, with no extra manual step to forget.
- **Consequences:** A merged branch is gone from GitHub straight away, provided Actions are enabled for the organization (to be confirmed on the first merge). Work that continues after a merge goes on a new branch.
- **Trace:** issue #4, PR #5, branch `chore/repo-cleanup`

## D-013: Process files are committed separately from code
- **Date:** 2026-10-21
- **Status:** Accepted
- **Context:** `/wrap-up` committed the process files on whatever branch was checked out, so prompt logs and session logs ended up in the same branches and PRs as code. Process and code should be kept apart, in a single repo.
- **Alternatives:** (a) Keep committing process files together with code. (b) An orphan branch `process`, checked out as a worktree at `docs/process/` and never merged into `main`. (c) Keep `docs/process/` on `main`, but commit it only through its own `docs/process-<date>` PRs.
- **Decision:** (c). `/wrap-up` only writes documentation. The new `/commit-logs` commits everything uncommitted in `docs/process/` on `docs/process-<date>`, runs the secret scan, and merges it through its own PR; it runs only on `main`. Code commits never touch `docs/process/`; code PRs link to session logs and reference D-xxx. A workflow (`process-separation.yml`) fails any PR that mixes the two.
- **Rationale:** (b) was rejected: the examiner checks out the last commit on `main`, which would contain no process documents, every link between code and logs would cross branches (the grading guide's "partly implicit" level), and the orphan branch would lose the existing history. (c) keeps the logs in the examiner's checkout while the history shows the separation. `/commit-logs` runs on `main` because git refuses to switch branches when untracked local copies of files merged to `main` exist, even with identical content (tested); and it merges its own PR straight away so new prompts are never written into a file that `main` does not track yet.
- **Consequences:** Process files stay uncommitted between `/commit-logs` runs, possibly across several sessions. The grading criteria files stay in `docs/process/`, since the Norwegian original links to `decisions.md` and must not be edited.
- **Trace:** branch `chore/logging-rework`, session log 2026-10-21

## D-014: The teacher's sesjonslogg skill runs as a second log
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The teacher added the `sesjonslogg` skill and a Norwegian "Sesjonslogg" section to `CLAUDE.md` (commit `e4caf48`). The skill writes per-user logs and open items to `.logs/<user>/` and commits them right away on the current branch with `Logg: <title>`. That clashes with "never commit directly to `main`", "do not commit unless asked", the commit message convention, and the `process-separation` check, which would fail a `/commit-logs` PR carrying a log commit.
- **Alternatives:** (a) Replace `/wrap-up` with `sesjonslogg`. (b) Keep both, treat `.logs/` as process files and skip the skill's commit step, so only `/commit-logs` commits it (drafted first in this session, then rejected by the user, who wanted the teacher's skill to work exactly as set up). (c) Keep both unchanged and make room for the skill's own commits.
- **Decision:** (c). The skill and the teacher's `CLAUDE.md` section are left as they are. `CLAUDE.md` gets an exception: `Logg:` commits of `.logs/` are allowed on any branch, including local `main`, without asking. The `process-separation` workflow ignores `.logs/`, so log commits can ride along in code PRs and `/commit-logs` PRs. `sesjonslogg` runs before `/wrap-up`. `/wrap-up` and `/commit-logs` are unchanged.
- **Rationale:** The teacher's log works the way the teacher expects, and the teacher's updates pull in without conflicts. `docs/process/` keeps the full trace (prompts, transcripts, decisions) that the grading guide asks for. Log commits are separate commits, so code and logs stay apart in the history even when they share a PR.
- **Consequences:** Code PRs may contain `Logg:` commits. A log commit made on `main` stays local until the next `/commit-logs`, which branches from `main` and carries it along. If a later skill version changes how it commits, this decision must be checked again.
- **Trace:** commits `e4caf48`, `5afbf34`, branch `chore/sesjonslogg-integration`, PR #14, session log 2026-10-28

## D-015: Local reflection notes per session
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The assignment ends with a reflection report (template in `docs/reflections/reflection-report-template.en.md`). Notes written during the project make it easier to write, but the user wants them separate from the process logs. Everything typed in the chat is logged by the prompt hook and the transcript.
- **Alternatives:** (a) The user answers reflection questions in the chat at `/wrap-up`. (b) As (a), but the hooks filter out the answers. (c) `/wrap-up` adds an empty entry to a notes file, and the user writes in their own editor. For the location: a hidden `.reflections/` folder, or `docs/reflections/`. For versioning: commit the notes, or keep them local.
- **Decision:** (c). As the last step, `/wrap-up` appends an empty entry (date, session ID, link to the session log, six questions mapped to sections in the template) to `docs/reflections/notes.md` without reading earlier entries. The file is gitignored. Claude never reads, quotes or logs its content. The template (Norwegian original and English translation) is versioned in `docs/reflections/`. No separate `/reflect` command.
- **Rationale:** (a) would put the reflections in prompts and transcripts; (b) is fragile, and the text would still reach the model and the transcript. `docs/reflections/` keeps everything in the repo, as the user wanted, and outside `docs/process/`, which `/commit-logs` commits automatically. Keeping the notes local makes it easier to write honestly.
- **Consequences:** The notes have no backup through git; they are lost if the local clone is deleted. Whether to commit them is left open. Only the existence of the notes is part of the trace, not what they say.
- **Trace:** commit `abafdc9`, branch `chore/reflection-notes`, PR #18, session log 2026-10-28

## D-016: Parallel sessions in worktrees and a one-command session end
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The end-of-session routine took eight steps and many tokens, `/wrap-up` read the whole prompt log to find the session ID, showed the session log as a draft in the chat before writing it, ran the transcript script twice, and repeated what `sesjonslogg` had just written. The user also wants several sessions writing code at once, which the old setup did not handle: sessions in one folder share the checked-out branch, the session ID was taken from "the newest entry" in a shared prompt log, and `/commit-logs` switched branches while other sessions were writing prompt logs.
- **Alternatives:** For parallel work: (a) several sessions in one folder, (b) one git worktree per code session with process files spread over the worktrees, (c) one worktree per code session with all process files written in the main folder. For the session ID: (a) the newest transcript file, which picks the wrong session when several run, (b) printed by the prompt hook on `/wrap-up`. For the transcript: (a) `/wrap-up` writes it, the SessionEnd hook as a safety net, (b) only the SessionEnd hook, always overwriting. For the end of a session: separate steps, or one `/wrap-up` that also commits, pushes and opens the PR.
- **Decision:** One worktree per code session (`.claude/scripts/start.sh`), and the main folder stays on `main`; the hooks and `/wrap-up` find the main folder with `git rev-parse --git-common-dir` and write all process files there. The prompt hook prints the session ID and the main folder on `/wrap-up`. The SessionEnd hook alone writes the transcript and overwrites. `/wrap-up` shows one proposal (files, commit message, PR), commits, pushes and opens the PR after the user's ok, runs `sesjonslogg`, and writes a shorter session log directly (header with links, the AI-suggestion table, bugs, decisions) that links to the teacher's log instead of repeating it. Merging and cleanup are a script (`finish.sh`). `/commit-logs` becomes a script (`commit-logs.sh`) that commits on local `main` and pushes as `docs/process-<date>` without switching branch.
- **Rationale:** Worktrees give each session its own branch; one place for process files keeps `/commit-logs` simple and code branches free of `docs/process/`, so D-013 and its CI check stay as they are. The hook knows its own session, so nothing is guessed. A transcript written at the very end is complete (messages after `/wrap-up` used to be lost). Writing the session log once and reusing the PR text halves the text Claude writes. Fixed git and `gh` steps cost no tokens as scripts and behave the same every time. Not switching branch avoids the git error D-013 describes when files change mid-run.
- **Consequences:** Amends D-007 (the transcript is no longer made by `/wrap-up`), D-013 (`/commit-logs` commits on local `main`; it still reaches `main` only through a PR) and the routine in D-014. `CLAUDE.md` now lets `/wrap-up` commit, push and open a PR after one confirmation; it never merges. No transcript is written if Claude Code ends without the SessionEnd hook running; `transcript-to-md.py --session <id>` is the manual backup. The teacher's `.logs/` numbering can repeat across parallel sessions; that is left alone. Each worktree needs its own `.env` (copied by `start.sh`) and dependencies.
- **Trace:** branch `chore/parallel-sessions-logging`, session log 2026-10-28


## D-017: Claude API, not the Claude Code CLI, as the real metadata provider
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The brief named the Claude Code CLI on the agency's subscription as v1's real AI provider, because the agency already pays for Claude Code. Before the PRD, research checked whether that is allowed and practical for a web app backend.
- **Alternatives:** Claude Code CLI with subscription login; Claude API with an API key (Haiku-class vision model); Claude Agent SDK with an API key; Gemini Flash-Lite (paid tier); a local model through Ollama.
- **Decision:** v1 ships the mock provider (default) and a Claude API provider with an API key. The provider and key come from environment variables by default, documented in `.env.example`. An admin settings page can override them, with the key stored encrypted, masked and never logged, so the agency or an examiner can use their own key. The key comes from a Claude Console organisation linked to the agency's Team plan if the agency agrees, otherwise from the user's personal Console account.
- **Rationale:** Anthropic's terms reserve subscription (OAuth) login for ordinary use of Claude Code and ask products and services to use API keys, and Claude Code's recommended scripting mode (`--bare`) needs an API key anyway. Max and Team plans now include monthly API credits, and a ~1000 px image costs about $0.0003 on Haiku 5.5, so the cost argument for the CLI is gone. The API takes images directly with JSON output and clear errors. Weighted score: Claude API 465, Gemini Flash-Lite 425, Agent SDK 415, Ollama 325 out of 500. The CLI was cut on the terms gate.
- **Consequences:** The brief and addendum are updated. Norwegian-language quality is unverified, so a pilot of about 20 images comes before the architecture. CLI providers in stage 2 are only added if their terms allow backend use. Gemini's free tier must never be used with real images. The admin settings page is a new v1 requirement for the PRD.
- **Trace:** PR #22 (`docs/pre-prd-research`), `_bmad-output/planning-artifacts/research/technical-claude-cli-metadata-provider-2026-10-28/research.md`, session log 2026-10-28-pre-prd-research

## D-018: Client organisations, licences that survive changes, and a revoke action
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The brief treated a client as a single login, called acquisitions purchases, and left open whether a client keeps an image after staff change its visibility. These choices shape the data model and the access test matrix, so they were settled in a brainstorm before the PRD.
- **Alternatives:** One shared login per client vs an organisation with contacts; purchases owned by the user vs the organisation; free access always live vs kept once downloaded; licences never removable vs removable through a deliberate action; a temporary password vs a setup link for first login; "view as client" in v1 vs later.
- **Decision:** A client is an organisation with contacts. Access, licences and history belong to the organisation. A purchase is a licence: one type in v1 (standard commercial use) with one standard text, and a first free download records a 0 kr licence. Licences survive changes of visibility and price, archiving, and contacts leaving. Removing one is a separate revoke action with a warning, a required reason and "remove anyway", and the licence is marked revoked, never deleted. Images with licences are archived, not deleted, and permanent file deletion is out of v1. Admins create accounts. Contacts log in with email and password, setting the first password and resets through a single-use setup link. No 2FA in v1. "View as client" is a later feature.
- **Rationale:** The user's principle is that what a client has already received cannot be taken back, but rights problems or mistakes can force removal, so removal must be explicit and recorded. Organisation-level ownership matches how agency clients buy. Setup links work without sending email and upgrade to emailed links later without rework.
- **Consequences:** The brief's success criteria for the access matrix and the licence log are rewritten. The PRD adopts the truth table (A1–A10) and edge tests (S1–S15) in `brainstorm-intent.md`. The invoicing view shows only licences above 0 kr. Further licence types and full texts, a client-admin role, emailed links and file deletion move to later stages.
- **Trace:** PR #22 (`docs/pre-prd-research`), `_bmad-output/brainstorming/brainstorm-client-model-access-2026-10-28/brainstorm-intent.md`, session log 2026-10-28-pre-prd-research

## D-019: v1 runs by 2026-12-05
- **Date:** 2026-10-28
- **Status:** Superseded by D-026
- **Context:** The project plan assumed a mid-December deadline. The official IBE160 deadline is not set yet.
- **Alternatives:** Plan against mid-December; plan against an own, earlier target.
- **Decision:** v1 runs by Saturday 2026-12-05. Build in weeks 46–48, polish and freeze in week 49, and week 50 onwards as buffer, delivery and reflection report.
- **Rationale:** A couple of weeks of buffer before the likely deadline for adjustments and the reflection report (30 % of the final grade).
- **Consequences:** Planning must finish by about week 45. `project-plan.md` is updated; the official deadline stays an open item.
- **Trace:** commit `f5f7bfa`, PR #25, [session log](sessions/2026-10-28-haiku-pilot.md)

## D-020: Pilot images from Wikimedia Commons, CC0 or public domain, kept local
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The Haiku 5.5 pilot (D-017) needs about 20 images that may be used freely, with EXIF, GPS and IPTC cases.
- **Alternatives:** Own photos; Unsplash or Pexels (licences forbid resale and competing services); Wikimedia Commons CC0/PD. For storage: commit in the pilot folder, a new `sample-data/` folder, or local only.
- **Decision:** 20 CC0/PD images from Wikimedia Commons, selected by structured-data licence, without files labelled "(Unsplash)" or with clear brands. The images stay local (gitignored); `sources.md` lists author, licence and link and how to rebuild them.
- **Rationale:** Machine-checkable licences, Norwegian places with GPS, and no need to take photos now. Keeping them local leaves the repo light until the architecture decides where sample data lives.
- **Consequences:** `finish.sh` deletes the images with the worktree, so they must be moved out or rebuilt from `sources.md`. The app's seed images are decided separately.
- **Trace:** commit `09eee99`, PR #25, [session log](sessions/2026-10-28-haiku-pilot.md)

## D-021: Haiku 5.5 at medium effort for v1, with the AI provider kept swappable
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** D-017 chose the Claude API with a Haiku-class model, pending a pilot of Norwegian quality and latency. The pilot ran 90 calls on 20 images with two prompt versions, two effort levels and a Sonnet 5.5 comparison.
- **Alternatives:** Haiku 5.5 at `low` (median 3.4 s, too many language errors); Haiku 5.5 at `medium` (median 5.9 s, few errors); Sonnet 5.5 at `low` (similar language to Haiku `medium` on five images, about 15× the cost); Gemini Flash (not tested yet).
- **Decision:** v1 uses Claude Haiku 5.5 at effort `medium` with prompt v2 from the pilot. The user accepts the median latency of 5.9 s, above the pilot's 5 s target. Gemini Flash is tested later if there is time. The provider stays a setting: one provider interface, a provider-neutral and versioned prompt and output schema owned by the app, shared post-processing (keyword cap, alt-text length), reverse geocoding in the app instead of place names from the model, settings per provider, and provider/model/prompt version stored with each metadata record. v1 still ships only the mock and Claude providers (D-010, D-017).
- **Rationale:** At `medium`, Haiku's Norwegian is mostly "edit, not rewrite" at about $0.0007 per image; Sonnet did not write better for the extra cost. The user expects Gemini Flash may be better and faster, and the agency should be able to choose Claude, Google or a local model, so adding a provider must mean one adapter and not a rewrite.
- **Consequences:** The architecture must include the provider interface and the requirements listed in `results.md`. Whether metadata is generated during upload or in the background is open for the architecture. The pilot's 1–3 scores are still to be filled in by the user.
- **Trace:** PR #25 (`docs/haiku-pilot`, commit `2ac117c`), `_bmad-output/planning-artifacts/research/pilot-haiku-metadata-2026-10-28/results.md`, session log [2026-10-28-haiku-pilot-2](sessions/2026-10-28-haiku-pilot-2.md)

## D-022: The PRD changes the brief's v1, and grows it where the app needs it
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The teacher's feedback (2026-10-06) asked for a narrower v1 built around the core flow. Writing the PRD through user journeys showed that the brief's flow left out things a staff member or a client needs to actually use the app, and settled several details the brief left open or got wrong.
- **Alternatives:** Keep the brief's v1 exactly and log purchases directly from the image page; add the journey features to v1 with a ranked cut line; move them all to stage 2.
- **Decision:** The PRD (`_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-10-28/prd.md`) supersedes the brief where they differ. Added to v1: batch upload with batch settings and shared keywords, draft and publish with background generation and a one-editor-at-a-time lock on each image and batch, a cart and checkout without payment or invoices, a ZIP download, a client dashboard with My images and Find images, an action log, place names derived offline from GPS, and a fixed search test. Changed: the price comes from the licence type (USD, one type in v1) and the image is only free or paid; a filename match shows both images side by side and staff keep both or discard; client copies drop all location data (coordinates and structured place fields, refining D-011) but keep camera data and date taken; generated metadata is English in v1; accessibility follows the Norwegian public-sector rules (WCAG 2.1 A and AA). Dropped from v1: PDF invoices and the invoicing view (the staff transaction log can show paid licences only). Each FR is tagged spine, v1 or cut-first, and the cut-first items have a fallback.
- **Rationale:** The user's reasoning: these features must be included to make the app usable, and v1 is still narrower than the original brief (versioning, near-duplicates, branding and backups stay out). The cut line keeps the teacher's minimal flow safe if the schedule slips.
- **Consequences:** The brief gets a note that the PRD supersedes it. The access tests follow the PRD's access table. The data model stores a currency code on every price and treats licence types as records. Architecture must provide an offline reverse geocoder and an edit lock.
- **Trace:** PRD run folder `_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-10-28/` (`.memlog.md`, `review-rubric.md`), session log for 2026-10-28 PRD session

## D-023: A new PRD run with a rollout gate after v1
- **Date:** 2026-11-04
- **Status:** Accepted
- **Context:** The user asked to redo the PRD of 2026-10-28 at higher rigor, with the same product thinking, and to count the agency's real rollout alongside the graded deliverable. An audit against the inputs found gaps in that PRD, listed in the new addendum. The brainstorm's 72-hour setup link had also become 7 days in the PRD session with no decision recording it.
- **Alternatives:** A blank restart, an in-place update or validating first, against a new run with the old PRD as input. For rollout: build the rollout needs into v1, against a separate gate after v1. For place names: always sending them to the AI, against a per-batch setting. For publishing: requiring a title and alt text (the draft), against a warning only.
- **Decision:** The PRD in `_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-04/` replaces the PRD of 2026-10-28 and refines D-011 and D-022. (1) A Rollout Gate (RG-1 to RG-14) must be met before real data enters the system; v1 stays on sample data, so D-009 holds. The real library is expected to hold 5,000–50,000 images. (2) A per-batch setting decides whether the AI receives place names, on by default. (3) Images can be published with missing metadata, with a warning, though it is not recommended; pages fall back to the title or "Untitled image". An image cannot be published while it is uploading, queued or generating, and retry works on drafts only. (4) Clients search text and keywords only in v1. A later version adds map search, so every image keeps its coordinates and place name, and one rule decides whether a client may see them. Client copies stay free of location data even then. (5) Setup links expire after 7 days. (6) WCAG 2.1 A and AA is the project's own target, not a stated legal requirement, since Uutilsynet's page does not settle whether a gated B2B portal is covered (changes D-022).
- **Rationale:** The rollout gate, place-name setting, publishing rule, map search and library size are the user's decisions. The gate keeps v1 achievable by 2026-12-05 while recording what real use requires. Client copies stay location-free because a map needs no location in the files, and D-011's reason still applies.
- **Consequences:** The old PRD and the brief point to the new PRD, and the addendum maps old FR IDs to new ones. v1 gained requirements, and the 45–65 h estimate is out of date, so v1 must be re-estimated and the [v1] FRs ranked at sprint planning. Legal points in the rollout gate still need checking against primary sources. How client map search works is Open Question 5.
- **Trace:** PR #31 (`docs/prd-v2`, commit `67de10a`), PRD run folder (`.memlog.md`, `reconcile-inputs.md`, `review-rubric.md`), [session log](sessions/2026-11-04-prd-high-effort.md)

## D-024: Follow the accessibility target whatever the legal scope, and defer the remaining legal checks past v1
- **Date:** 2026-11-04
- **Status:** Accepted
- **Context:** The legal research of 2026-11-04 could not settle whether an invitation-only B2B portal falls under the universal-design rules. It suggested asking Uutilsynet in writing, asking Anthropic how its DPA applies to a Norwegian exporter, having a legal reviewer look at the unresolved questions, and re-checking the pending legislation before rollout. It also found that FR-19's warn-and-publish rule can fail WCAG 1.1.1, because an image can go live with its title or "Untitled image" as alt text.
- **Alternatives:** Ask Uutilsynet first and let the answer decide, against following the target either way. For alt text: block publishing when it is missing (Claude's recommendation), against keeping warn and publish.
- **Decision:** (1) The app follows NFR-5's WCAG 2.1 A and AA target whether or not the law covers the portal, so the Uutilsynet question is not needed. (2) FR-19 stays as decided in D-023: missing alt text warns and does not block. The PRD states this as a known exception to the target. (3) The remaining checks are out of scope for v1 and may be picked up later: Anthropic's DPA and retention, the legal reviewer's questions, and the re-check of Prop. 41 LS and the Norwegian AI Act bill.
- **Rationale:** The user's reasoning: accessibility matters to them regardless of the legal answer, and the other checks do not belong in this project's v1. The user kept warn and publish when asked directly, rejecting Claude's recommendation to block.
- **Consequences:** An image published without alt text can fail WCAG 1.1.1, so v1 does not fully meet its own target in that case. Staff review of AI alt text remains the main control. V1 stays on sample data (D-009), and the Rollout Gate still applies before real data enters the system, so the deferred questions remain unanswered there. RG-9 must be reworded, because it still asks for Uutilsynet's confirmation. NFR-5 and RG-9 change when the research recommendations are applied to the PRD with `bmad-prd`; the PRD has not been changed yet.
- **Trace:** Run folder `_bmad-output/planning-artifacts/research/domain-ai-images-privacy-accessibility-legal-2026-11-04/` (`research.md`, `.memlog.md`), `.logs/marthekalland3/990-2026-11-04-08-40-59-legal-research.md`, session log for the 2026-11-04 legal research session

## D-025: Apply the legal research to the PRD, with four conflicts resolved
- **Date:** 2026-11-04
- **Status:** Accepted
- **Context:** The legal research of 2026-11-04 recommended changes to the PRD (V-1, V-2, RG-3, RG-4, RG-5, RG-6, RG-9, new RG-15 and RG-16, NFR-3, the addendum table), and D-024 changed some of them. Four recommendations conflicted with existing text or with D-024.
- **Alternatives:** V-1: no names at all, against allowing names written in the image or given in metadata. RG-4: anonymise at once and list the retention periods beside it, against anonymising when the period ends. The checks D-024 defers: Open Questions only, against keeping them in the gate. RG-9: say nothing about FR-19, against management accepting the exception.
- **Decision:** (1) The prompt tells the model not to state or infer sensitive attributes and never to work out who a person is from their appearance. Names written in the image or given in metadata stay usable. (2) Records the law requires stay unchanged for their retention period and are anonymised when it ends; other licence records are anonymised at once. (3) The checks D-024 defers stay in the Rollout Gate (RG-3, RG-5, RG-6, RG-16). (4) FR-19 stays warn and publish, and management explicitly accepts NFR-5's known exception in RG-9 before rollout. The remaining recommendations are applied as the report states them, without the Uutilsynet question.
- **Rationale:** The user chose Claude's recommendation on all four. Names keep staff search working as in prompt v2. Immediate anonymising can't be squared with keeping invoices in their original format. Nothing in the gate is built for v1, and management can still accept skipping an item. Management's acceptance makes the legal cost of FR-19 a stated choice at rollout.
- **Consequences:** v1's prompt becomes v3, which has not been piloted, so Open Question 3 now asks for an English check that includes the pilot's images of people. RG-5's licensing block covers images whose subject is an identifiable person, and how incidental people are treated is left to the legal basis chosen in advance. Those two points, and the conditional wording of the WCAG 2.0 minimum in NFR-5, were Claude's calls, flagged to the user, who changed none of them.
- **Trace:** PR #34, commit `4184767`, [session log](sessions/2026-11-04-prd-legal-update.md), [legal research](../../_bmad-output/planning-artifacts/research/domain-ai-images-privacy-accessibility-legal-2026-11-04/research.md)

## D-026: Final deadline 2026-12-15, with about 130 hours for everything
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** D-019 set an own target of 2026-12-05. On 2026-11-18 planning was still running, with no code yet, and the teacher's PRD feedback asked for the hours actually available.
- **Alternatives:** Keep 2026-12-05 and cut scope hard; plan against the final deadline.
- **Decision:** v1 is planned against the final deadline, 2026-12-15. About 130 hours remain from 2026-11-18, covering the rest of planning, building, delivery and the reflection report. About 87 hours of that are for building. Coding starts 2026-11-22. The 2026-12-05 target no longer applies.
- **Rationale:** The user's own estimate of time left. The budget split (about 13 h planning, 7 h delivery, 10 h reflection report, 13 h buffer) was Claude's estimate, accepted by the user.
- **Consequences:** The PRD's Release Stages and priority table are built on this budget. `project-plan.md` still has the old calendar and should be updated at sprint planning.
- **Trace:** PR #37, commit `7654134`, [session log](sessions/2026-11-18-prd-feedback-revision.md), [PRD 2026-11-18](../../_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-18/prd.md)

## D-027: The app and its tests run in Docker
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** The teacher's PRD feedback asked which operating systems are supported, since NFR-1 promised a run from "a clean machine" and the metadata research had not tested Windows.
- **Alternatives:** Run on the host and list the supported systems; run everything in containers.
- **Decision:** The app, its tests and every tool they need (such as ExifTool) run in Docker with Compose v2. It is developed on macOS, and CI builds and tests it on x86 Linux. NFR-1 now starts from "a machine with Docker installed".
- **Rationale:** The user's choice. With containers the host system does not matter, and the README's commands are the same everywhere.
- **Consequences:** The reason the metadata research preferred `exiftool-vendored` (no hand install) no longer applies, so the architecture can choose the metadata library on its merits. The architecture must handle Windows line endings in scripts (`.gitattributes`) and differences between Apple Silicon and x86. Building the images needs network access; running does not.
- **Trace:** PR #37, commit `7654134`, [session log](sessions/2026-11-18-prd-feedback-revision.md), NFR-1 and the addendum's metadata contract

## D-028: IIM values are shortened safely, and XMP keeps the full value
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** IPTC-IIM limits fields in bytes (title 64, description 2000, keyword 64), and æøå take two bytes each in UTF-8. The 11-04 addendum left the shortening to the architecture, and the teacher asked for it to be settled before then.
- **Alternatives:** (A) XMP and EXIF only, no IIM. (B) Write IIM, shortened by the app. (C) Cap the agency fields at the IIM byte limits.
- **Decision:** B. The app shortens IIM values at the last whole word that fits, or at the last whole character if the first word alone is too long, so IIM always holds valid UTF-8 and is declared as UTF-8. A keyword over 64 bytes is left out of IIM only. XMP and EXIF always hold the full value. A is the fallback if time runs short.
- **Rationale:** Claude's recommendation, accepted by the user. B keeps FR-34's promise for about an hour of work. C was rejected because byte limits confuse staff.
- **Consequences:** FR-34 and SC-16 (a test with 40 "æ"). The rubric review caught that the first wording ("at a whole word") contradicted SC-16; it was fixed before the commit.
- **Trace:** PR #37, commit `7654134`, [session log](sessions/2026-11-18-prd-feedback-revision.md), FR-34, SC-16

## D-029: The spine is the MVP, the rest is ranked, and a checkpoint draws the cut line
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** The teacher's feedback (4.1, 4.5) said the [v1] FRs had no order and that compound tags such as "[spine; side-by-side is cut-first]" made stories unclear. The old 2026-11-22 checkpoint could not be met.
- **Alternatives:** The teacher's example MVP list, or the existing spine. For the tags: split FRs into a/b IDs, keep the IDs and split only in a table, or give the split parts new numbers.
- **Decision:** The spine is the minimum usable v1 (about 75 h). Five FRs are planned after it (FR-9, FR-14, FR-16b, FR-38a, FR-31; about 10.5 h). Ranks 6–22 are bonus, built in rank order only if hours remain, each with a fallback. FRs with two tags are split into a/b IDs. The tags are [spine], [planned], [bonus] and [stretch]. The checkpoint is 2026-11-30: if the spine runs, the cut line is drawn and the freeze date set; if not, a reduced spine applies. The first stories build a thin slice through the whole spine.
- **Rationale:** The user chose the spine as the MVP and the 30 November checkpoint. Claude proposed the ranking, and the user moved the cut line from after rank 6 to after rank 5, so FR-25 Revoke became a bonus. The freeze date is set at the checkpoint, at the user's wish, rather than Claude's suggested 2026-12-08. The thin slice and the reduced spine came from the rubric review.
- **Consequences:** Epics and stories follow the ranks. SCs for bonus FRs apply only if those FRs are built. Each cut at the checkpoint gets its own D-entry.
- **Trace:** PR #37, commit `7654134`, [session log](sessions/2026-11-18-prd-feedback-revision.md), the PRD's Release Stages

## D-030: The Rollout Gate moves to its own file
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** The teacher's feedback (4.2) said the Rollout Gate made up about a quarter of the PRD and hid what v1 must finish.
- **Alternatives:** Move it to the addendum; move it to its own `rollout-gate.md`.
- **Decision:** `rollout-gate.md` in the PRD run folder holds RG-1 to RG-16 in full and the questions for the agency. The PRD keeps one line per item with its owner.
- **Rationale:** Claude's recommendation, accepted by the user. The gate is a sign-off checklist for agency management and a legal reviewer, while the addendum holds background for UX and architecture.
- **Consequences:** The RG owners were drafted by Claude and accepted by the user. The parts that shape v1 stay in NFR-3 and NFR-9.
- **Trace:** PR #37, commit `7654134`, [session log](sessions/2026-11-18-prd-feedback-revision.md), [rollout-gate.md](../../_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-18/rollout-gate.md)

## D-031: Designsystemet as the UI component system
- **Date:** 2026-11-18
- **Status:** Accepted (settled by D-038: Designsystemet React)
- **Context:** The UX work (`bmad-ux`) needed a component library to design against. The user wanted Designsystemet (Digdir, designsystemet.no) and a custom theme on top of it. `architecture/technology.md` names shadcn/ui with Tailwind.
- **Alternatives:** Designsystemet with a custom theme; shadcn/ui as `technology.md` names it; no system.
- **Decision:** All UX mocks are built on Designsystemet (CSS 1.23.0, since 1.24.0 was less than two weeks old). The theme will be generated with its theme builder or `designsystemet.config.json`. The stack choice in `technology.md` is settled in the architecture step.
- **Rationale:** This was the user's choice. Its accessibility focus fits the PRD's WCAG 2.1 AA requirement, it ships CSS and React packages, and it is themeable.
- **Consequences:** `DESIGN.md` tokens will map to Designsystemet's theme tokens. Some components (tabs, dropdown placement, the character counter) need `@digdir/designsystemet-web` or `-react` at build time. If architecture keeps shadcn/ui, the UX spec must be reconciled.
- **Trace:** PR #38, commit `6f47061`, [session log](sessions/2026-11-18-ux-design-round-1-2.md), `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/.memlog.md`

## D-032: Anthropic's frontend-design skill as a project skill
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** The user asked about adding more design skills for the UX stage and asked Claude to install `frontend-design` from Anthropic's skills repo. That repo's `example-skills` plugin bundles 12 skills.
- **Alternatives:** Install the whole `example-skills` plugin at user level; copy only `frontend-design` into `.claude/skills/`; use no extra skill.
- **Decision:** Only `frontend-design` (Apache-2.0, from `anthropics/skills` commit `e4bb5d9`, 2026-11-16) is copied into `.claude/skills/frontend-design/` with its licence. The Anthropic marketplace was also added to the user's Claude Code settings.
- **Rationale:** Claude's call, explained to the user afterwards. The bundle has a shadcn-based builder that clashes with D-031 and a second `skill-creator`. Keeping the skill in the repo makes it versioned and traceable.
- **Consequences:** The renderer subagents read the skill. Updates are manual: copy a newer version from the marketplace clone when needed.
- **Trace:** PR #38, commit `b3bfdbd`, [session log](sessions/2026-11-18-ux-design-round-1-2.md)

## D-033: Library edits are saved explicitly; upload drafts autosave
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** In UX round 2 the user rejected autosave in the Library inspector and asked for an Edit step and a Save changes button. When the spines were distilled, the subagent found that PRD FR-17 said "Edits are saved automatically".
- **Alternatives:** Update the PRD to match the UX; keep the PRD's autosave everywhere.
- **Decision:** An image in the Library is edited with view mode → Edit → Save changes or Cancel. Leaving with unsaved changes opens a dialog with Save changes, Discard and Keep editing. Drafts in the upload review keep autosave. The FR-18 edit lock starts when the user chooses Edit and ends on Save changes, Cancel or Discard, on leaving, or after 15 minutes idle. PRD FR-17 and FR-18 and the addendum are updated.
- **Rationale:** The user's choice: an extra step before changing an image that may already be published, and no silent saves. Upload drafts are work in progress, where saving as you type helps.
- **Consequences:** Two save models, by surface. Stories for FR-17 must cover both, plus the unsaved-changes dialog. SC-10 (edit locks) follows the new lock start.
- **Trace:** PR #40, commit `c627ed3`, [session log](sessions/2026-11-18-ux-design-round-3.md), `EXPERIENCE.md` "Editing and saving"

## D-034: No client ownership of public images in v1
- **Date:** 2026-11-18
- **Status:** Accepted
- **Context:** The user wanted staff to link clients to public images too, so that an image can belong to one client and still be for sale to others. In the PRD, only restricted images have a client list, and a public image is "own" only through a licence.
- **Alternatives:** A: staff grant a 0 USD licence ("Owned by"), which leaves the access table unchanged. B: a client list on public images, which changes FR-21 and access table rows A1–A3. C: leave it out of v1.
- **Decision:** C. Nothing is added to v1. If it comes later, A is the preferred model. The PRD addendum's data-model table now says a licence records how it came about (purchase, free download or granted by staff) and may have no contact.
- **Rationale:** The user expects very few real cases. A can be added later without changing the access rules, if the licence record allows it from the start.
- **Consequences:** The architecture step should give the licence record a source field and allow a licence without a contact. The inspector shows the client picker for Restricted only.
- **Trace:** PR #40, commit `c627ed3`, [session log](sessions/2026-11-18-ux-design-round-3.md), `.memlog.md`

## D-035: Licence text has no visible version; the accepted text is stored with each licence
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** The more-screens mock showed "Standard commercial use, text version 2" at checkout and on the receipt. The PRD (FR-33, FR-40) keeps "the licence text as accepted" but says nothing about version numbers. The mock's licence text was placeholder text written by the renderer.
- **Alternatives:** No visible version, with a snapshot per licence; a visible version number; an "updated <date>" label.
- **Decision:** No version number or date is shown anywhere. Each licence stores a snapshot of the text the contact accepted. In Settings, saving a new licence text says it applies to new licences only. The licence text in mocks, prototype and seed data is labelled sample text; the agency's legal reviewer writes the real text before launch (RG-6).
- **Rationale:** User's choice. Clients only need the text they accepted, which the snapshot gives them. A counter would add a field and a concept without a user need.
- **Consequences:** The licence record needs a text snapshot field (architecture). Seed data marks the text as a sample.
- **Trace:** PR #42, [session log](sessions/2026-11-20-ux-finalize-prototype.md), `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/.memlog.md`

## D-036: Shared batch metadata and a "Licensed images" concept are out of v1
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** When the user reviewed the clickable prototype, they asked for two things. First, batch settings that set the same title, description and alt text on every photo. Second, a clearer split for clients between "My images" and "Licensed images". Both would change the PRD: FR-9 and FR-11 for the first, and FR-28, FR-33 and the access wording for the second.
- **Alternatives:** Add both to v1; add them later.
- **Decision:** Both are out of v1. Batch settings stay as they are: visibility, price, the AI and place-name options, and batch keywords. Client navigation and access wording stay as in the PRD and the UX spines.
- **Rationale:** User's choice, to protect the remaining hours before the 2026-12-15 deadline.
- **Consequences:** No PRD change. Both can come back as "Later" items.
- **Trace:** PR #42, [session log](sessions/2026-11-20-ux-finalize-prototype.md), UX memlog entry of 2026-11-20

## D-037: No licence-type filter on staff Licences while v1 has one licence type
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** While reviewing the prototype, the user asked whether the staff Licences page needs a licence-type filter. v1 has one licence type, standard commercial use (FR-23).
- **Alternatives:** Show the filter disabled; hide it until a second licence type exists.
- **Decision:** Hide it. The Licences filters stay client, date range and paid only. A licence-type filter is added when a second licence type exists.
- **Rationale:** User's choice. A filter with one option adds no value, and a disabled control needs a reason next to it.
- **Consequences:** No PRD change. EXPERIENCE.md (IA, Licences row) records the rule. The Licences story should not build the filter.
- **Trace:** PR #43, [session log](sessions/2026-11-20-ux-prototype-feedback.md), UX memlog entry of 2026-11-20

## D-038: Next.js full-stack TypeScript with Designsystemet React
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** The architecture step had to choose the stack. The teacher advises one common, well-documented stack with local file storage, no more complex than needed. `technology.md` (the teacher's example) uses FastAPI + Next.js + Caddy + Redis + Supabase. The user had little FastAPI experience and no preference, wanted cheap or free options, and Vercel was mentioned in class. D-031 left Designsystemet vs shadcn/ui open.
- **Alternatives:** (A) Django 6.1 + HTMX + Designsystemet CSS and web components; (B) Next.js full-stack TypeScript + Designsystemet React; (C) FastAPI + React SPA; (D) FastAPI + HTMX.
- **Decision:** (B). One Next.js 16 app (Node 26 LTS) with Designsystemet React, a worker process from the same code and image, and PostgreSQL. ExifTool through `exiftool-vendored`, as the metadata research recommended for Node. Vercel is not a v1 target; hosting is chosen at RG-1.
- **Rationale:** The user's choice. Claude recommended (A), because Django has login, sessions, CSRF, translations and migrations built in. The user preferred (B) for correct-by-construction Designsystemet markup and ARIA, `exiftool-vendored`, and the many Next.js libraries and examples, and accepted building auth and access rules with them. (C) and (D) were ruled out: two codebases, or Django's built-ins lost. Vercel's 4.5 MB request limit and lack of a long-running worker do not fit 50 MB uploads or background generation.
- **Consequences:** Auth, CSRF on route handlers, the ORM, translations and the job queue are chosen and wired by us (D-039, D-040). Designsystemet versions follow the two-week rule (1.24.0, not 1.24.1). The spine must fix where access and session checks live (D-041).
- **Trace:** PR #45, `_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/.memlog.md`, [session log](sessions/2026-11-20-architecture-stack-and-boundaries.md)

## D-039: Own small session module instead of an auth library
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** Login has exact rules: no sign-up or email, staff-issued setup links (single-use, 7 days, a new link cancels the old), status checked on every request (S1, S2), a new password ends other sessions, 8 hours idle ends a session, and messages tested word for word.
- **Alternatives:** Better Auth (admin plugin, reset token used as setup link); an own module following the Lucia guide; Auth.js.
- **Decision:** An own module: a sessions table, a random token in an httpOnly cookie stored hashed, argon2 password hashes, a setup-link table. Only this module touches sessions, cookies, password hashes and setup links.
- **Rationale:** Claude's recommendation, accepted by the user. The feature set is small and exact, so a library would mostly be switched off and its default routes locked down. Auth.js pushes email-and-password login toward JWT, which cannot honour S1, S2 or "end other sessions" cleanly.
- **Consequences:** We own the security code and test each rule. A later switch to Better Auth stays at about half a day to a day, because only the auth module and its tables change.
- **Trace:** PR #45, [session log](sessions/2026-11-20-architecture-stack-and-boundaries.md)

## D-040: Drizzle as the database layer
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** The Next.js stack (D-038) needs an ORM and migrations on PostgreSQL.
- **Alternatives:** Drizzle; Prisma.
- **Decision:** Drizzle (`drizzle-orm`, `drizzle-kit` migrations).
- **Rationale:** Claude's recommendation, accepted by the user. The access rules and S5 (one active licence, as a partial unique index), `ON CONFLICT` for double submits and queue locking read most clearly close to SQL. Prisma's npm `latest` tag pointed to an 8.0 release candidate on 2026-11-20.
- **Consequences:** One data-access style across modules; the schema lives in TypeScript.
- **Trace:** PR #45, [session log](sessions/2026-11-20-architecture-stack-and-boundaries.md)

## D-041: A modular monolith with domain modules, built in vertical slices
- **Date:** 2026-11-20
- **Status:** Accepted
- **Context:** Every story follows the code organisation, and shared rules (the access table, one active licence, no location data in client copies) must exist once (NFR-2a).
- **Alternatives:** Domain modules (modular monolith); use-case slices as code structure; technical layers (`components/`, `services/`, `repositories/`).
- **Decision:** Domain modules in `src/modules/<domain>`, with stories delivered as vertical slices through routes and the modules they need. Five rules: routes are thin and only modules touch the database; a module's public API is its `index.ts`; one owning module per table; the `access` module alone decides what a client may see, download or buy; reads in Server Components, form changes through Server Actions, file traffic through Route Handlers that check the request origin themselves.
- **Rationale:** Proposed by Claude and accepted by the user after asking how it differs from vertical slices. Use-case slices would repeat the shared rules; technical layers spread one feature across many folders.
- **Consequences:** The architecture spine states these rules. The access module's exact shape is still open in the run's memlog.
- **Trace:** PR #45, [session log](sessions/2026-11-20-architecture-stack-and-boundaries.md)

## D-042: One access condition in SQL, and access tests through real routes
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** D-041 left the access module's shape open. Every client list, count, page and file must agree on what a client may see, and SC-1 promises tests "through the same routes users hit".
- **Alternatives:** One SQL condition "visible to client X" vs load images and decide with if/else per image; full matrix through routes vs module-level tests plus one representative route test per kind (which would have needed an SC-1 change).
- **Decision:** One SQL condition plus computed own/canDownload/canBuy, used by every client-facing read; client routes get a fixed `ClientImage` view with no location or staff fields. The A1–A13 matrix and read S-rules run as table-driven HTTP tests over one seed fixture; mutation S-rules run at the module function the Server Action calls, plus one browser test each. SC-1 is unchanged.
- **Rationale:** One place that can be wrong instead of one per page; lists, counts and pages cannot disagree. HTTP-level tests are cheap once the fixture and `loginAs` helper exist, and they back the most important criterion directly.
- **Consequences:** The first auth story builds the shared fixture and `loginAs`. Spine AD-6, AD-7.
- **Trace:** PR #47, [session log](sessions/2026-11-23-architecture-spine.md), [spine](../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md)

## D-043: The image table is the job queue for AI generation
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** FR-15 (background generation) is a bonus; without it images are processed while the upload page waits. Both must share one code path, and after a restart every image must end ready or failed.
- **Alternatives:** pg-boss or graphile-worker (own job tables) vs the image's own processing state as the queue.
- **Decision:** The worker claims queued images with `FOR UPDATE SKIP LOCKED` and a lease; generation runs in three steps (claim, call the provider outside any transaction, save only if the token matches and the image is still a draft). One `generateMetadata` function is called inline without FR-15 and by a worker service with it.
- **Rationale:** A queue library keeps a second record of job state that can drift from the image's state. The three-step shape came from the reviewer gate, which found that one transaction would hold a row lock through a 30 s call.
- **Consequences:** Without FR-15, interrupted images become failed at app start. Spine AD-12.
- **Trace:** PR #47, [session log](sessions/2026-11-23-architecture-spine.md), [spine](../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md)

## D-044: Local file storage behind one interface; client copies built on demand and checked for location data
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** FR-35/FR-36 forbid location data in anything a client receives; the addendum settles local storage for v1, with cheaper separate storage wanted later (RG-1).
- **Alternatives:** Cache client copies per metadata revision vs build on demand; trust the stripping step vs read every client file back against the location checklist.
- **Decision:** A `FileStore` interface used only by the media module, local disk in v1. Thumbnails and previews are made once with no metadata and checked once; client and staff copies are built per download (about a second for 50 MB, accepted by the user) and each client copy is checked before it is sent; a hit fails closed.
- **Rationale:** No stale copies or cache cleanup; an S3-compatible store later is one new implementation. The read-back check turns FR-36 into a testable guarantee.
- **Consequences:** Spine AD-15 to AD-17.
- **Trace:** PR #47, [session log](sessions/2026-11-23-architecture-spine.md), [spine](../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md)

## D-045: Place names from a committed GeoNames extract
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** FR-13 needs an offline place-name lookup; the addendum left the data set and its credit to the architecture.
- **Alternatives:** An npm offline geocoder (downloads GeoNames on first use, so network at runtime); Kartverket municipality boundaries (Norway only, needs PostGIS); a trimmed GeoNames extract.
- **Decision:** A kept script builds a compressed GeoNames extract (Norwegian populated places with municipality and county, world cities over 15,000), committed with its download date and loaded into Postgres by the migrate service; nearest place within a radius in SQL. GeoNames (CC BY 4.0) is credited in the README, beside the data and on the staff help page.
- **Rationale:** No network at runtime (D-027). GeoNames already has Norway's 15 counties from 2024, checked on 2026-11-23.
- **Consequences:** Spine AD-23.
- **Trace:** PR #47, [session log](sessions/2026-11-23-architecture-spine.md), [spine](../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md)

## D-046: Client copies keep the EXIF orientation tag
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Client copies keep the original pixels and only FR-35's whitelist of metadata. Orientation was not on the whitelist, so portrait camera photos would arrive sideways.
- **Alternatives:** Keep the Orientation tag; or rotate and re-encode the pixels, losing quality and the "original pixels untouched" rule.
- **Decision:** Keep EXIF Orientation as a technical tag. Derived files are auto-oriented before stripping. FR-35 updated, with an entry in the addendum's "Changes from the architecture".
- **Rationale:** Orientation is not location data; keeping it costs nothing and keeps downloads lossless.
- **Consequences:** The PRD edit was made directly, not through `bmad-correct-course` as the PRD's release-stages section asks; whether to run it is an open item.
- **Trace:** PR #47 (commit `4b030f6`), [session log](sessions/2026-11-23-architecture-spine.md)

## D-047: Generated keywords carry a category in prompt v3
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The UX groups generated keywords by FR-12's seven categories with "(n of 15)", but the pilot's output schema returns a flat keyword list.
- **Alternatives:** Add a category to the v3 output schema; or drop the grouping from the UX.
- **Decision:** The v3 schema returns keywords as `{term, category}`; categories are stored on AI keyword rows. Embedded, shared and hand-written keywords sit in their own group.
- **Rationale:** Cheap before the AI story is built, costly after; v3 is not piloted yet anyway.
- **Consequences:** Prompt v3 must be piloted before relying on it (PRD Open Question 3). EXPERIENCE.md updated. Spine AD-10, AD-21.
- **Trace:** PR #47, [session log](sessions/2026-11-23-architecture-spine.md)

## D-048: A paid image's price comes from its licence type
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** PRD FR-23/FR-40 price a paid image by its licence type, set in Settings; the UX showed an amount field on each image. The cart and checkout re-check must compare one price.
- **Alternatives:** Price on the licence type (PRD); or a per-image amount (UX), which needed a PRD change.
- **Decision:** An image stores only free or paid; the amount is the licence type's current price. The image's access controls show it read-only with a link to Settings. Cart lines store the licence type and the price the contact saw.
- **Rationale:** Follows the PRD and gives display, cart and checkout one source.
- **Consequences:** EXPERIENCE.md and DESIGN.md updated; the mockups and prototype still show the old field (the spec wins). Spine AD-18, AD-19.
- **Trace:** PR #47 (commit `4b030f6`), [session log](sessions/2026-11-23-architecture-spine.md)

## D-049: The architecture spine is final after a five-reviewer gate
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The spine is the contract every story builds against, mostly by Claude. A draft written by the same session that coached it misses its own holes.
- **Alternatives:** Finalize after a self-check; or run independent reviewers first.
- **Decision:** Five reviewer subagents ran in parallel (PRD reconcile, UX/addendum reconcile, checklist, version check, adversarial). All findings were fixed or put to the user, and the spine was marked final with AD-1 to AD-24. Versions are pinned at least two weeks old.
- **Rationale:** The reviewers found real holes the draft had: guards missing in Server Actions, a lost update that could give a revoked client access again, images stuck without FR-15, a wrong AI input size, three pins that broke the two-week rule, and starter defaults that fight the design.
- **Consequences:** Stories cite AD IDs. Next step: `bmad-create-epics-and-stories`.
- **Trace:** PR #47 (commit `edec73f`), [session log](sessions/2026-11-23-architecture-spine.md), review reports in `reviews/` next to the spine

## D-050: Epics start with a thin slice; stories run spine → planned → bonus inside each epic
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The PRD wants a thin slice through the whole spine first and a checkpoint on 2026-11-30 (SC-3 in mock mode), and it ranks the non-spine FRs for a cut line. BMad's epic rules want epics by user value that never depend on a later epic.
- **Alternatives:** Epics by area only (no slice, so the checkpoint flow comes late); epics by tier (spine / planned / bonus), which mixes unrelated features in one epic; a slice epic followed by area epics with tier order inside each.
- **Decision:** Epic 1 is the thin slice (9 stories, ending in the SC-3 e2e test). Epics 2–6 complete one area each (accounts, upload and metadata, finding images, licensing and downloads, administration); Epic 7 makes the app ready for the examiner. Inside each epic, stories run spine → planned → bonus with the PRD rank, and a separate build order in `epics.md` follows the tiers across epics. FR-38b (activity list) moved from Epic 4 to Epic 6 during story writing, because it lists downloads that only the action log (FR-42a) records.
- **Rationale:** Keeps the checkpoint question answerable early and lets the cut line be drawn by dropping stories at the bottom of the rank list, not by restructuring epics. Moving FR-38b avoids an epic depending on a later one; its rank (20, after FR-42a's 8) keeps the build order unchanged.
- **Consequences:** 7 epics, 56 stories, each with a "Traces to" line (FR / AD / UX-DR / SC, tag, estimate, fallback). Sprint planning must follow the build order, not the epic order. Epics 1, 3 and 4 all touch the Library Details panel; accepted, since later epics extend the slice instead of rebuilding it.
- **Trace:** PR #49 (commit `4854c8d`), [session log](sessions/2026-11-23-epics-and-stories.md), `_bmad-output/planning-artifacts/epics.md`

## D-051: Client search also matches alt text
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** PRD FR-28 said client search matches title, description and keywords; architecture AD-6 lists title, description, alt text and keywords. Found while extracting requirements for the epics.
- **Alternatives:** Keep the PRD wording and change AD-6; follow AD-6 and align the PRD.
- **Decision:** Follow AD-6. FR-28 now says title, description, alt text and keywords; a row in the PRD addendum's "Changes from the architecture" table records it.
- **Rationale:** Alt text is an agency field clients already see on the image page, so matching it reveals nothing, and one client field set keeps `buildSearchCondition` simple.
- **Consequences:** Story 4.4 tests client search over alt text. The PRD was edited directly, like FR-35 earlier, so it belongs in the open question of whether such alignments go through `bmad-correct-course`.
- **Trace:** PR #49 (commit `2d7c332`), [session log](sessions/2026-11-23-epics-and-stories.md)

## D-052: Story estimates exceed the PRD's spine budget; nothing is cut before the checkpoint
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Estimating each story (tests and the per-story routine included) puts the spine at about 99 h, against 75 h in the PRD and about 87 h of build time in total; Epic 1 alone is about 45 h against the PRD's 35–40 h before the checkpoint. Most of the gap is Epic 1 and UX surfaces the PRD's per-FR estimates did not price.
- **Alternatives:** Cut now (all bonus ranks and the UX cut candidates; the spine would still be about 92 h); or keep the stories and decide at the checkpoint with real hours.
- **Decision:** Cut nothing now. `epics.md` gets an hours table and three spine cut candidates with fallbacks: 3.6 Files that need you come first (~2.5 h), 4.7 Image walls adapt to the screen and the viewer (~2 h), and the drawer and breakpoint work in 1.3 (~2 h).
- **Rationale:** The estimates are rough on both sides. Epic 1's actual hours on 2026-11-30 show which estimates hold, and the PRD's checkpoint process (cut line by rank, reduced spine if the slice fails) already handles the outcome.
- **Consequences:** At the checkpoint, compare Epic 1's actual hours with ~45 h, then draw the cut line. Each cut gets its own D-entry; PRD changes go through `bmad-correct-course`.
- **Trace:** PR #49, [session log](sessions/2026-11-23-epics-and-stories.md), "Hours and cut candidates" in `epics.md`

## D-053: The tests run as their own Compose project, always on the mock, with a guarded test-database reset
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.1 needs one README test command that runs Vitest against a freshly migrated test database and Playwright against `app-test`, shows both outputs and fails when a test fails (NFR-1, AD-7). The spec preferred a single `docker compose up --exit-code-from e2e`. The review also found that test containers inherited `AI_PROVIDER` and a real `ANTHROPIC_API_KEY` from a local `.env`, and that the reset (which drops the schema) only checked that the test URL differed from `DATABASE_URL`.
- **Alternatives:** (A) one `compose up --exit-code-from e2e`; (B) two `compose run` steps in the dev project; (C) two `compose run` steps in a separate project `crm-dam-test`, preceded by `down -v`.
- **Decision:** (C). The README test command runs `down -v`, then `run --rm --build unit`, then `run --rm --build e2e`, all with `-p crm-dam-test --profile test`; CI runs the same steps plus lint and typecheck. Test file directories are tmpfs, so they are empty on every start. The test containers always use `AI_PROVIDER=mock` with an empty key. The reset refuses unless the target database name ends in `_test` and differs from `DATABASE_URL`.
- **Rationale:** (A) was tried: Compose aborted when Vitest exited 0, then hung after Playwright passed. A separate project has its own database volume, so a test run never stops or touches the dev stack. Forcing the mock keeps tests free and offline whatever `.env` holds; the `_test` rule is a positive check before a destructive reset.
- **Consequences:** The test command is one long line of three Compose calls; the test stack stays up after a run until `down -v`. Later stories add tests to the same `unit` and `e2e` services; access tests (AD-7) reuse the same reset.
- **Trace:** PR #51, Story 1.1, [spec](../../_bmad-output/implementation-artifacts/spec-1-1-the-app-starts-from-one-command.md), [session log](sessions/2026-11-23-1-1-app-starts-from-one-command.md)

## D-054: Log out is the one Server Action without a role guard
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The story 1.2 spec says every page, Server Action and Route Handler calls a guard first, except the public Login page, the root redirect and `/api/health`. Log out is a Server Action used by both roles. `requireStaff()` refuses contacts and `requireContact()` refuses staff. Both guards send an expired session to Login instead of letting the user leave.
- **Alternatives:** (A) no guard; Log out calls `auth.endCurrentSession()`, which acts only on the caller's own cookie; (B) a new `requireAnyRole()` guard used by Log out; (C) two Log out actions, one per role guard.
- **Decision:** (A). `endCurrentSession()` deletes the session behind the caller's cookie and clears the cookie, and does nothing without one. Log out is added to the spec rule's exceptions.
- **Rationale:** Log out takes no input, reads no data and can end only the sender's own session, so a guard would protect nothing. (B) and (C) add code whose only effect is to block logging out of an expired or deactivated session. The AI (bmad-build implementation subagent) proposed the exception; the user accepted it after the review.
- **Consequences:** Any other Server Action or Route Handler without a guard still breaks the rule. A new exception needs its own D-entry. If Log out later does more than end the caller's session (e.g. `images.releaseLocksOf`, AD-5), it must use the guard's Actor rather than trust the cookie alone.
- **Trace:** PR #53, Story 1.2, [spec](../../_bmad-output/implementation-artifacts/spec-1-2-staff-and-contacts-log-in-and-out.md) (Implementation Notes), `src/app/_components/actions.ts`, [session log](sessions/2026-11-23-1-2-staff-and-contacts-log-in-and-out.md)

## D-055: The Graphite theme is generated with the Designsystemet 1.24 CLI, with every DESIGN.md role pinned as an override, and the CSS is committed
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.3 requires the Graphite theme "generated from `designsystemet.config.json`". DESIGN.md's config sample uses the pre-1.24 nested shape (`main`/`support`), and the role values in DESIGN.md came from the 1.23 theme builder in the mockups. In a scratch run, the 1.24.0 CLI generated other values from the same base colours (accent-hover `#36393e` instead of `#1D1F24`, text `#2a2c2e` instead of `#202124`). The deprecated `@digdir/designsystemet-theme` package is no option (architecture review F9).
- **Alternatives:** (A) the 1.24 CLI with flat `colors`, status colours in `overrides.severity`, and every DESIGN.md Colors-table role pinned in `overrides.colors.<color>.<token>.light` plus `overrides.focus`; generated CSS committed; (B) accept the CLI's 1.24 values and update DESIGN.md to match; (C) hand-write the `--ds-*` variables in CSS, without the CLI.
- **Decision:** (A). New dev dependency `@digdir/designsystemet` 1.24.0 (CLI), script `npm run theme:build`; `src/styles/theme/graphite.css` is generated and committed, never edited by hand. `src/styles/theme/theme.test.ts` checks each role against the generated CSS. Also added: `@digdir/designsystemet-react` and `-css` 1.24.0 (stack table) and `@axe-core/playwright` 4.14.0 (pinned in the spine) for the axe scans.
- **Rationale:** (A) keeps both DESIGN.md (whose contrast table was checked against its values) and the AC's "generated from the config". (B) would change approved, contrast-checked colours. (C) breaks the AC and loses the generated full scales. Committing the CSS keeps builds reproducible and the diff reviewable. Claude found the shape and value differences while planning; the user approved the spec.
- **Consequences:** Changing a colour means editing the config and running `theme:build`, then committing both. Nothing in CI yet checks that the committed CSS matches the config (deferred in `deferred-work.md`). `designsystemet.config.json` sits in the repo root, which the CLI expects but CLAUDE.md's "no loose files in the root" does not list as an exception; still open.
- **Trace:** PR #54, Story 1.3, [spec](../../_bmad-output/implementation-artifacts/spec-1-3-staff-and-client-shells-in-the-graphite-theme.md), `designsystemet.config.json`, [session log](sessions/2026-11-23-story-1-3-shells.md)

## D-056: Story 1.3 ships Overview as a contact tab, with placeholder Upload and Find images pages
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.3's AC lists the tabs "built so far": staff Library and Upload, contacts Find images. `/upload` (1.4) and `/find-images` (1.8) did not exist yet, and contacts land on `/overview`, which the AC does not list, so their landing page would have no current tab.
- **Alternatives:** (A) the AC's tabs exactly, with placeholder pages; (B) the AC's tabs plus Overview for contacts, with placeholder pages; (C) only tabs whose pages exist (Library; Overview), adding Upload and Find images in 1.4 and 1.8.
- **Decision:** (B). Staff tabs Library and Upload; contact tabs Overview and Find images. `/upload` and `/find-images` are guarded placeholder pages with a one-line empty state until 1.4 and 1.8 replace them. Before filters exist, the Library sidebar holds a "Filters" heading and one muted line.
- **Rationale:** The user's choice of the three options Claude presented. It matches EXPERIENCE.md's IA (Overview is a main-nav tab), gives the landing page an `aria-current` tab, and lets the drawer AC be tested now.
- **Consequences:** Two placeholder pages and a placeholder sidebar line must be removed or replaced in stories 1.4, 1.8 and the Library filter story. Both placeholder pages are on the axe scan list and have cross-role 403 tests.
- **Trace:** PR #54, Story 1.3, [spec](../../_bmad-output/implementation-artifacts/spec-1-3-staff-and-client-shells-in-the-graphite-theme.md) (Decisions), [session log](sessions/2026-11-23-story-1-3-shells.md)

## D-057: Upload rows are created by a Server Action, then each file goes as a raw-body PUT, one at a time, outside the proxy
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** AD-11 requires the image row (`uploading`) before the file is sent, and AD-4 sends file traffic through Route Handlers. The architecture leaves the transport open (multipart or raw body, concurrency). Server Actions cap bodies at 1 MB, and the existing `src/proxy.ts` would cap request bodies at 10 MB (architecture review F11), while files may be 50 MB.
- **Alternatives:** Multipart POST with row creation in the same request; raw-body PUT per file; parallel or sequential sending; raising the proxy's body limit instead of excluding the route.
- **Decision:** A Server Action creates the batch (if needed) and all rows at once; the browser then sends each file as the raw `application/octet-stream` body of `PUT /api/images/<id>/file`, one file at a time. The route is excluded from the proxy matcher (anchored to exactly that path), and checks `Origin` against `APP_ORIGIN`.
- **Rationale:** A raw body streams straight to `tmp/` with the hash computed in-stream, never buffered; an abort surfaces as a stream error that triggers cleanup. Rows-first gives each file a visible row at once. Sequential sending keeps the first cut simple; the parallel queue is AD-13 / Story 3.1.
- **Consequences:** Story 3.1 replaces the sequential loop with the queue provider. Any future route under `/api/images/<id>/file` gets no request-path header from the proxy. A test uploads a > 10 MB PNG to prove the exclusion works.
- **Trace:** PR #56, Story 1.4, [spec](../../_bmad-output/implementation-artifacts/spec-1-4-staff-upload-an-image-and-the-library-stores-it-safely.md) (Design Notes), [session log](sessions/2026-11-23-story-1-4-upload.md)

## D-058: The Upload page keeps the current batch in the URL (`/upload?batch=<id>`)
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Until Story 3.1 adds sidebar batch lists, file rows only lived in the browser; a reload would empty the page although the drafts are stored.
- **Alternatives:** (a) browser-only rows, lost on reload; (b) the batch id in the URL, with the server rendering that batch's stored rows.
- **Decision:** (b), the user's choice. After the first file is added, the URL becomes `/upload?batch=<id>` (replace, no navigation). A reload renders the batch's stored rows; rows still `uploading` show the lost-connection message, since nothing sends them any more. Rejected files are not stored, so they do not survive a reload. A batch id that is not a UUID, does not exist or belongs to another staff user gives a fresh page.
- **Rationale:** Losing the list on reload looks like lost uploads. It costs one read function and one page branch.
- **Consequences:** Story 3.1's batch lists can link to the same URL.
- **Trace:** PR #56, Story 1.4, [spec](../../_bmad-output/implementation-artifacts/spec-1-4-staff-upload-an-image-and-the-library-stores-it-safely.md) (Decisions), [session log](sessions/2026-11-23-story-1-4-upload.md)

## D-059: Derived files are WebP (thumbnail ≤ 480 px, preview ≤ 800 px), and embedded metadata is read XMP first, then IPTC-IIM, then EXIF
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** AD-16 fixes the preview at ≤ 800 px and the ICC-only rule but gives no thumbnail size or format. The metadata research gives the write mapping per field but no read precedence.
- **Alternatives:** JPEG or PNG derived files per source type; a 52 px thumbnail (the file-row size only); other read orders.
- **Decision:** Thumbnail and preview are auto-oriented WebP that keep only the ICC profile, ≤ 480 px and ≤ 800 px on the long edge. Fields are read XMP → IIM → EXIF (title `dc:title` → `ObjectName`; description `dc:description` → `Caption-Abstract` → `ImageDescription`, keeping line breaks; alt text `AltTextAccessibility`, cut to 250; keywords `dc:subject` → `Keywords`, deduplicated case-insensitively), all stripped of control characters.
- **Rationale:** WebP keeps alpha for PNGs and stays small; 480 px serves the later image walls on high-density screens. XMP holds full values while IIM may be truncated (research § C).
- **Consequences:** Thumbnail responses are `image/webp`. Library wall stories can reuse the thumbnail as is.
- **Trace:** PR #56, Story 1.4, [spec](../../_bmad-output/implementation-artifacts/spec-1-4-staff-upload-an-image-and-the-library-stores-it-safely.md) (Code Map), [session log](sessions/2026-11-23-story-1-4-upload.md)

## D-060: The AI provider port carries the file name as its own field, and the AI input is made in memory
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** AD-21 defines the port input as AI image, media type, metadata text and output language. AD-22 makes the mock pick fixtures and fail on demand by file name, which is not in that input. AD-16 lists the AI input as a derived file but not where it lives.
- **Alternatives:** put the file name in the metadata text (a real model would get it too); key fixtures on the original's hash (the port receives the derived image, not the original); store the AI input under `derived/` at upload.
- **Decision:** The port input gains `filename`, read only by the mock; real adapters ignore it. Media makes the AI input (auto-oriented, ≤ 1568 px, sRGB JPEG, no metadata) in memory from the stored original for each run and never stores it. The mock fails as `unavailable`; an unknown `AI_PROVIDER` also fails as `unavailable` until the Claude adapter (Story 3.5).
- **Rationale:** File names can carry client names and are noise for a model; keeping the name out of the text keeps the Claude adapter clean. Making the input on demand avoids another stored file and lets retry (3.9) remake it.
- **Consequences:** Story 3.5's adapter must not forward `filename`. Seed fixtures in Story 1.7 are keyed by the seed image's file name.
- **Trace:** PR #57, Story 1.5, [spec](../../_bmad-output/implementation-artifacts/spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md) (Design Notes), [session log](sessions/2026-11-23-story-1-5-ai-metadata.md)

## D-061: A Failed upload row shows the Failed tag only until Story 3.2
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.5 makes images end `failed` when generation fails; FR-16a wants a plain reason, and Story 3.2 owns the exact NFR-7 message with one reason per error category.
- **Alternatives:** the NFR-7 message with one generic reason now; all seven per-category reasons now.
- **Decision:** In Story 1.5 a Failed row shows the Failed tag, with the embedded title (or "Untitled image") over the file name and no message line. The failure reason is stored in `images.failure_reason`.
- **Rationale:** Keeps 1.5 to the AI pipeline; the reason copy is written once, in 3.2.
- **Consequences:** Until 3.2, staff see that generation failed but not why.
- **Trace:** PR #57, Story 1.5, [spec](../../_bmad-output/implementation-artifacts/spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md) (Decisions), [session log](sessions/2026-11-23-story-1-5-ai-metadata.md)

## D-062: The restricted client list is cleared when an image leaves Restricted
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.6 review found that saving an image as Public or Internal kept its `image_clients` rows hidden; switching back to Restricted brought the old clients back with their old `addedAt`, so AD-6's "visible since" would be wrong for them. The spec did not settle it.
- **Alternatives:** keep the hidden list for convenience when switching back.
- **Decision:** `saveAccess` deletes the image's restricted list whenever visibility is saved as anything other than Restricted, and ignores `added`; re-added clients get a fresh `addedAt`.
- **Rationale:** Matches how `visibleToAllSince` is reset when an image leaves Public; no hidden state.
- **Consequences:** Staff re-pick clients after switching back to Restricted.
- **Trace:** PR #59, Story 1.6, [spec](../../_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md) (Decisions, Spec Change Log), [session log](sessions/2026-11-23-story-1-6-publish.md)

## D-063: The Library's unsaved-changes dialog is deferred to Story 3.4
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** UX-DR-20 asks for a "You have unsaved changes" dialog when leaving Library edit mode with changes; Story 1.6's ACs do not.
- **Alternatives:** build it in 1.6 (about 1 h more).
- **Decision:** Defer it to Story 3.4, when metadata fields join edit mode. Until then, selecting another tile or page while editing drops the edits without asking.
- **Rationale:** In 1.6 edit mode holds only three access controls; the dialog matters more once metadata is edited.
- **Consequences:** Logged in `deferred-work.md`; 3.4 must add it.
- **Trace:** PR #59, Story 1.6, [spec](../../_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md) (Decisions), [session log](sessions/2026-11-23-story-1-6-publish.md)

## D-064: The seed creates the licence type on every start
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The seed ran only on an empty `users` table, so databases seeded before Story 1.6 would never get the "Standard commercial use" licence type that paid prices come from.
- **Alternatives:** a data migration; requiring a database reset.
- **Decision:** `seedIfEmpty` calls `licences.ensureStandardLicenceType` before the users check. It is idempotent and serialised with an advisory lock.
- **Rationale:** Seed data goes through module functions (AD-3), never migrations; no reset needed for existing dev databases.
- **Consequences:** With `SEED_ON_START=true`, every start makes sure the licence type exists; the rest of the seed still runs only once.
- **Trace:** PR #59, Story 1.6, [spec](../../_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md), [session log](sessions/2026-11-23-story-1-6-publish.md)

## D-065: The sample library uses the developer's own photos
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.7 needs 20–40 freely usable images in the repo (not Unsplash or Pexels). CLAUDE.md says not to commit large binary files.
- **Alternatives:** CC0 or public-domain images from other sources; releasing the own photos under CC0.
- **Decision:** The 22 seed images are the developer's own phone photos, at most 1600 px and under 500 KB each (8.1 MB in total). Camera metadata is stripped, except GPS, City and Country on the two location test files and an EXIF thumbnail on one file. The licence is "Photos by Marthe Kalland, © all rights reserved, used only as sample data in this repo". The originals stay outside the repo. The book-cover photo was dropped because its cover shows a swastika; photos with children (no clear faces), a signed painting and 3M samples were kept.
- **Rationale:** The story allows the user's own photos. The licence keeps the rights with the photographer, since CC0 cannot be taken back. The size budget keeps the repo small.
- **Consequences:** `fixture.test.ts` checks the budget (at most 40 files, under 500 KB each, at most 1600 px) and which files keep metadata. New seed images must follow `SOURCES.md`.
- **Trace:** PR #62, Story 1.7, [spec](../../_bmad-output/implementation-artifacts/spec-1-7-the-examiner-starts-with-a-sample-library.md), [session log](sessions/2026-11-23-1-7-sample-library.md)

## D-066: The image seed has its own gate, and `archiveImage` comes before Story 4.2
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The users seed runs only on an empty `users` table, so dev databases seeded earlier would never get the sample images. Access row A11 needs an archived image, archiving arrives in Story 4.2, and the seed may not write to the database directly.
- **Alternatives:** seed images only together with the users; leave A11 out until 4.2.
- **Decision:** `seedSampleLibrary` runs when the `images` table is empty, independent of the users check, under the seed's advisory lock. A minimal `archiveImage(actor, id)` in the images module (published → archived, one conditional update, no UI) seeds A11.
- **Rationale:** Existing dev databases get the library without a reset. The story's acceptance criteria name A11, and 4.2 can reuse the function for its UI.
- **Consequences:** The first start on an empty database takes about 40 s longer. An interrupted first start leaves a partial library until `docker compose down -v`. The e2e database is always seeded, so the empty Library page is no longer tested end to end (deferred-work.md).
- **Trace:** PR #62, Story 1.7, [spec](../../_bmad-output/implementation-artifacts/spec-1-7-the-examiner-starts-with-a-sample-library.md), [session log](sessions/2026-11-23-1-7-sample-library.md)

## D-067: The two location test images carry hand-written public positions
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** Story 1.7 needs a JPEG with GPS and city fields and a PNG with location data. The developer's phone photos (D-065) have GPS tags, but every one is empty, so no photo holds a real position.
- **Alternatives:** find other photos with real GPS; leave the location cases out of the seed.
- **Decision:** `IMG_20260720_144130024.jpg` gets Stortorget, Tromsø (69.6489 N, 18.9553 E) and City "Tromsø", Country "Norway". `IMG_20260720_122021652.png`, taken at Polaria, gets Polaria (69.6431 N, 18.9481 E) and the same place fields. Both positions are approximations of public places, written with `exiftool`. The PNG was converted from the JPEG with `pngquant` (256 colours) to stay about 1600 px and under 500 KB.
- **Rationale:** The empty tags mean nothing private is published, and public positions near where the photos were taken make the location tests realistic without revealing where the developer has been.
- **Consequences:** `SOURCES.md` should say that the positions were added as test data. Refines D-065, which reads as if the phone recorded the GPS.
- **Trace:** session log [2026-11-23-seed-image-prep-and-worktrees.md](sessions/2026-11-23-seed-image-prep-and-worktrees.md), Story 1.7, PR #62

## D-068: The client image page is the Find images wall with `?image=`, and access reads what it needs itself
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** The Story 1.8 ACs test an "image page" for 404, but the UX gives clients no separate image page (the Details panel opens on the wall). The access module must also price images and give the file routes a file without creating module cycles.
- **Alternatives:** a dedicated `/find-images/[id]` route; call `licences.currentLicenceType` from access; let the images module serve contact files.
- **Decision:** The client image page is `/find-images?image=<id>`, as in the staff Library; a hidden or bad id gives the global Not found page (404). Access reads the current licence type itself (same oldest-first query, with a test that the two agree), because licences will call access (AD-3). `ClientImage` carries the latest `fileVersionId`, and the file routes go from `getClientImage` straight to `media.openDerivedFile`.
- **Rationale:** Keeps "the panel never navigates away", gives one place that decides visibility, and avoids an access ↔ licences or access ↔ images cycle.
- **Consequences:** Story 1.9 adds the licence branch to `ownedBy` as one more `or` term. The Not found page is rendered outside the client shell.
- **Trace:** PR #64, Story 1.8, [spec](../../_bmad-output/implementation-artifacts/spec-1-8-a-contact-finds-the-images-their-client-may-see.md), [session log](sessions/2026-11-23-1-8-contact-finds-images.md)

## D-069: Own tiles show "Yours to download" before download exists
- **Date:** 2026-11-23
- **Status:** Accepted
- **Context:** A free image restricted to the contact's client (A4) is own. UX-DR-13/15 give own tiles a tick and "Yours to download", but download arrives only in Epic 5.
- **Alternatives:** show the tick with "Free" until download ships.
- **Decision:** The user chose to show the tick and "Yours to download" now; the panel has no Download button until Epic 5.
- **Rationale:** Matches the UX spec, so Epic 5 only adds the button.
- **Consequences:** Until Epic 5 the caption promises an action the panel does not offer yet.
- **Trace:** PR #64, Story 1.8, [session log](sessions/2026-11-23-1-8-contact-finds-images.md)

## D-070: Clients e2e runs last as its own Playwright project
- **Date:** 2026-11-25
- **Status:** Accepted
- **Context:** The Story 2.1 e2e test sets the seeded client Nordlys Sykkel AS inactive to prove that its logged-in contact is refused (S2). Other e2e specs log in as Nordlys's contact Emil, and Playwright runs specs in parallel, so they could fail while Nordlys is inactive.
- **Alternatives:** Use a factory-made client and contact instead of a seeded one; run the whole suite serially; give the clients spec its own Playwright project that depends on the `app` project.
- **Decision:** `clients.spec.ts` runs as a third Playwright project, `clients`, after `seeded library` and `app`. Its `try/finally` sets Nordlys active again even if an assertion fails.
- **Rationale:** The e2e test exercises the seeded data the examiner uses, keeps the rest of the suite parallel, and adds one line of config.
- **Consequences:** Any later spec that changes a seeded client's or user's status belongs in this last project, or must use factory rows. The README describes the three projects.
- **Trace:** Story 2.1, PR #68, commit `a3e8006`, session log `sessions/2026-11-25-story-2-1-staff-create-and-manage-clients.md`

## D-071: Contacts: phone on users, unique email as the double-submit guard
- **Date:** 2026-11-25
- **Status:** Accepted
- **Context:** Story 2.2 needs an optional phone for contacts, which the data model did not have, and contact creation must not make duplicates on a double submit (Conventions: Idempotency).
- **Alternatives:** Phone in a separate contact-details table, or on `users`. For idempotency: a form nonce stored on `users` (as `clients.form_nonce` in Story 2.1), or the existing unique index on `lower(email)`.
- **Decision:** A nullable `users.phone` column (migration 0008). The unique email is the natural key: a repeated submit is refused as a duplicate email and creates nothing. Add/Edit contact are their own pages, like Add/Edit client (chosen by the user at spec approval).
- **Rationale:** One column is the smallest change and stays with the table `accounts` owns. The conventions use a unique constraint where a natural key exists; a nonce is only for creates without one.
- **Consequences:** A double submit shows "This email is already used by another user." on the second request after the first succeeded. Staff users can also carry a phone if Story 2.6 needs it.
- **Trace:** Story 2.2, `story/2.2-staff-add-and-manage-contacts`, spec `spec-2-2-staff-add-and-manage-contacts.md`, session log `2026-11-25-story-2-2-staff-add-and-manage-contacts.md`

## D-072: Setup links: hashed single-use tokens in the path, shown on the Add contact page
- **Date:** 2026-11-25
- **Status:** Accepted
- **Context:** Story 2.3 needs a way for contacts to set their own password, and the app sends no email (FR-4, AD-5). Staff must see the link right after creating a contact, and the token is a credential that must never be stored or logged in clear.
- **Alternatives:** After Add contact, redirect to the client page and show the link under the new row as in the mockup (the token would have to survive the redirect, e.g. in a short-lived cookie, and would reappear on reload); keep the token in the URL fragment so the server never sees it (needs a client round trip to check the link on open).
- **Decision:** A `setup_links` table owned by auth stores only the SHA-256 of a 256-bit token, with `expires_at` (7 days), `used_at` and `cancelled_at`. Links are `${APP_ORIGIN}/setup/<token>`; Next's dev request log ignores `/setup/` paths and the page sends no Referer. Issuing a link locks the user row and cancels earlier unused links; using one is a conditional update. The Add contact page does not redirect after a save; it shows the link with Copy and "Back to <client>". "New setup link" on each contact row shows its link under the row.
- **Rationale:** The token only ever leaves the server in the action response, so no cookie or redirect carries it. Path tokens match the mockup and keep the page a plain server-rendered form. The row lock and conditional update are tested under parallel calls.
- **Consequences:** Story 2.6 reuses `issueSetupLink` for staff users. Used, cancelled and expired rows are kept. A check that Next's request log hides `/setup/` paths is deferred (deferred-work.md).
- **Trace:** Story 2.3, PR #70, `_bmad-output/implementation-artifacts/spec-2-3-contacts-set-their-password-from-a-setup-link.md`, session log `sessions/2026-11-25-story-2-3-contacts-set-password-from-setup-link.md`
