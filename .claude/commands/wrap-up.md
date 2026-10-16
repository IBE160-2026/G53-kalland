---
description: Oppsummer arbeidsøkten i docs/process/sessions/ og oppdater beslutningsloggen
argument-hint: "[kort tema for økten]"
---

Lag en øktoppsummering for denne arbeidsøkten. Den er bevis for kriterium 1 (prosess og KI-styring) og 3 (kvalitetssikring) i `docs/process/vurderingskriterier.md`, så den må være **konkret og knyttet til faktiske endringer**, ikke generell.

Tema fra brukeren: $ARGUMENTS

## Fremgangsmåte

1. **Samle fakta**
   - Les gjennom samtalen i denne økten.
   - Finn forrige øktlogg i `docs/process/sessions/` (nyeste fil) og kjør `git log --oneline --since="<dato for forrige økt> 00:00"` på gjeldende branch (uten klokkeslett tolker git datoen som nåværende klokkeslett den dagen, og commits tidligere samme dag faller bort), samt `git status --short` og `git branch --show-current`.
   - Les dagens promptlogg i `docs/process/prompts/YYYY-MM-DD.md` for å finne tidspunktene til promptene i denne økten.

2. **Skriv utkast** til `docs/process/sessions/YYYY-MM-DD-<slug>.md` (slug fra temaet, små bokstaver, bindestreker; legg til `-2` osv. hvis filen finnes) med denne strukturen:

   ```markdown
   # Økt YYYY-MM-DD: <tema>

   - **Branch:** `<branch>`
   - **Story/oppgave:** <story-ID eller "–">
   - **Promptlogg:** [prompts/YYYY-MM-DD.md](../prompts/YYYY-MM-DD.md) (kl. HH:MM–HH:MM)

   ## Mål
   ## Viktigste prompts
   (Kort sitat eller parafrase, med klokkeslett fra promptloggen.)
   ## KI-forslag og vår vurdering
   | KI foreslo | Vi gjorde | Hvorfor |
   |---|---|---|
   (Akseptert / Justert / Avvist. Ta med minst ett eksempel på justering eller avvisning hvis det skjedde – ikke fabriker et.)
   ## Feil funnet i KI-generert kode
   (Hva, hvordan det ble oppdaget – test, review, manuell kjøring – og hvordan det ble rettet. "Ingen" er et gyldig svar.)
   ## Commits
   (`hash` melding)
   ## Beslutninger
   (Lenker til D-xxx i decisions.md)
   ## Neste steg
   ```

3. **Beslutninger:** For hvert reelt valg om teknologi, arkitektur, omfang eller arbeidsform i økten, foreslå en ny `D-xxx`-oppføring i `docs/process/decisions.md` etter malen der. Oppdater status på eksisterende oppføringer hvis økten avgjorde en åpen beslutning.

4. **Vis utkastet** (øktlogg + eventuelle endringer i decisions.md) til brukeren og **vent på godkjenning** før du skriver filene.

5. Etter skriving: foreslå en commit-melding (`docs(process): øktlogg <tema>`), men ikke commit uten at brukeren ber om det.

## Regler
- Skriv bare det som faktisk skjedde. Ikke finn på avvisninger, feil eller begrunnelser; spør brukeren hvis begrunnelsen for et valg er uklar.
- Ingen hemmeligheter, tokens eller innhold fra `.env` i loggen.
- Norsk språk (se D-003).
