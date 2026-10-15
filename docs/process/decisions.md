# Beslutningslogg

Viktige valg om teknologi, arkitektur, omfang og arbeidsform. Nye beslutninger legges nederst med neste ledige nummer. En beslutning som erstattes, markeres med **Status: Erstattet av D-xxx** – den slettes ikke.

Mal:

```markdown
## D-xxx: <kort tittel>
- **Dato:** YYYY-MM-DD
- **Status:** Vedtatt | Åpen | Erstattet av D-xxx
- **Kontekst:** Hvorfor måtte vi bestemme noe?
- **Alternativer:** Hva vurderte vi?
- **Beslutning:** Hva valgte vi?
- **Begrunnelse:** Hvorfor?
- **Konsekvenser:** Hva betyr det videre?
- **Spor:** commit/PR/story/øktlogg
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

## D-003: Norsk prosessdokumentasjon, engelske BMad-artefakter
- **Dato:** 2026-10-15
- **Status:** Vedtatt
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
- **Status:** Åpen
- **Kontekst:** Tilbakemeldingen på product brief (`_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/tilbakemelding-product-brief.md`) sier at V1 er stor for én person, at KI-metadata trenger testmodus/mock så sensor kan kjøre appen uten vår API-nøkkel, og at to suksesskriterier ikke er testbare.
- **Beslutning:** Ikke tatt ennå. Må avklares før PRD og arkitektur.
