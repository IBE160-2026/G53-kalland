# CLAUDE.md

Soloprosjekt i IBE160 Programmering med KI (høst 2026): CRM/DAM for et designbyrå. Se product brief og tilbakemelding i `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/`.

Repoet vurderes etter `docs/process/vurderingskriterier.md`. **Prosess og KI-styring teller 30 %**, så sporbarhet fra plan → prompt → commit → beslutning er like viktig som koden.

## Språk
- `README.md`, `CLAUDE.md` og `docs/process/` skrives på norsk.
- BMad-artefakter i `_bmad-output/` skrives på engelsk (`_bmad/config.toml`).
- Kode, identifikatorer og kodekommentarer på engelsk.

## Arbeidsflyt
- Aldri commit direkte til `main`. Én branch per story/oppgave: `story/<epic>.<story>-<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
- Merge via pull request. PR-beskrivelsen har: hva og hvorfor, lenke til story, hvordan det er testet, og hva som ble endret eller avvist i KI-forslag.
- Små, avgrensede commits med beskrivende meldinger på formen `type(scope): beskrivelse [S-<epic>.<story>]`, f.eks. `feat(upload): duplikatsjekk med hash [S-2.3]`. Typer: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
- Ikke commit eller push uten at brukeren ber om det.

## Sporbarhet og dokumentasjon
- Funksjoner skal kunne spores til en story i `_bmad-output/`. Endres planen, oppdater BMad-dokumentet **og** legg inn en oppføring i `docs/process/decisions.md`.
- Valg av teknologi, arkitektur, omfang eller arbeidsform → ny `D-xxx` i `docs/process/decisions.md`.
- Prompts logges automatisk til `docs/process/prompts/` (hook). Commit promptloggen sammen med arbeidet den hører til.
- Transkripsjonen av hver økt lagres som `docs/process/transcripts/<dato>-<økt-ID>.md` (bare bruker- og Claude-tekst, maskert). `/wrap-up` lager den; en SessionEnd-hook lager den bare hvis `/wrap-up` ikke ble kjørt.
- Kjør `/grading-check` ukentlig og før frist.

## Rutine ved øktslutt
1. Kjør `/wrap-up <tema>`. Den skriver øktloggen med lenke til transkripsjonen, oppdaterer `decisions.md`, scanner prosessfilene for hemmeligheter (stopper ved treff), og committer og pusher **bare** prosessfilene. På `main` lager den en `docs/`-branch og en PR i stedet. Å kjøre `/wrap-up` er tillatelse til den committen og pushen.
2. Avslutt økten (`/exit`). Meldingene etter `/wrap-up` kommer ikke med i transkripsjonen; committen viser utfallet. Glemmer du `/wrap-up`, skriver hooken transkripsjonen, og neste `/wrap-up` committer den.
3. Ikke lag logger eller transkripsjoner for tidligere økter i ettertid.
- Når brukeren avviser eller retter et forslag fra deg, skal det med i øktloggen. Ikke skjul eller pynt på det.

## Kode og kvalitet
- Hver feature leveres med tester av meningsfull logikk (særlig tilgangsregler: synlighet × pris). Testkommandoen i README skal alltid stemme.
- Den eksterne KI-tjenesten (bildemetadata) skal ha mock/testmodus slik at appen kan kjøres og testes uten API-nøkkel.
- Valider input og håndter feil med forståelige meldinger.
- Ingen død kode, utkommenterte rester eller dupliserte filer fra tidligere forsøk. Slett heller enn å kommentere ut.
- Hold deg til oppgaven: ikke skriv om filer utenfor det som er bedt om.

## Sikkerhet og ryddighet
- Aldri hemmeligheter i kode, prompts eller logger. Konfigurasjon via miljøvariabler; dokumenter alle i `.env.example`.
- Ikke commit `.env`, `node_modules`, `venv`, build-mapper eller store binærfiler (se `.gitignore`).
- Ingen løse filer i rotmappen. Dokumentasjon i `docs/`, planlegging i `_bmad-output/`.
- Sensorveiledningen (PDF) skal ikke versjoneres (D-004).

## README
Hold `README.md` oppdatert med: hva appen gjør og for hvem, forutsetninger med versjoner, eksakte installasjons- og oppstartskommandoer, miljøvariabler, testdata, hvordan testene kjøres, mappeoversikt og lenke til `docs/process/`.

## Push-tilgang
Push krever GitHub-kontoen `marthekalland3`. Sjekk `gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push'` før push.
