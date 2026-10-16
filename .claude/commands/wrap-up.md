---
description: Avslutt økten – øktlogg med lenke til transkripsjon, beslutningslogg, secret-scan, commit og push av prosessfiler
argument-hint: "[kort tema for økten]"
---

Avslutt denne arbeidsøkten. Øktloggen er bevis for kriterium 1 (prosess og KI-styring) og 3 (kvalitetssikring) i `docs/process/vurderingskriterier.md`, så den må være **konkret og knyttet til faktiske endringer**, ikke generell. At brukeren kjører `/wrap-up` er tillatelse til å committe og pushe prosessfilene (steg 6), men ikke annen kode.

Tema fra brukeren: $ARGUMENTS

## Fremgangsmåte

1. **Samle fakta**
   - Les gjennom samtalen i denne økten.
   - Finn forrige øktlogg i `docs/process/sessions/` (nyeste fil) og kjør `git log --oneline --since="<dato for forrige økt> 00:00"` på gjeldende branch (uten klokkeslett tolker git datoen som nåværende klokkeslett den dagen, og commits tidligere samme dag faller bort), samt `git status --short` og `git branch --show-current`.
   - Les dagens promptlogg i `docs/process/prompts/YYYY-MM-DD.md`. **Økt-ID-en** er de 8 tegnene i `økt \`xxxxxxxx\`` i den nyeste oppføringen (den som logget `/wrap-up`). Finn tidspunktene til promptene med samme økt-ID.

2. **Lag transkripsjonen** for denne økten nå, så den kommer med i samme commit:
   `python3 .claude/hooks/transcript-to-md.py --session <økt-ID>`
   Scriptet skriver ut filstien (`docs/process/transcripts/<dato>-<økt-ID>.md`). Kjør det på nytt hvis du må endre utkastet, så transkripsjonen kommer med. SessionEnd-hooken rører ikke filen etterpå, så meldingene etter dette steget kommer ikke med.

3. **Skriv utkast** til `docs/process/sessions/YYYY-MM-DD-<slug>.md` (slug fra temaet, små bokstaver, bindestreker; legg til `-2` osv. hvis filen finnes) med denne strukturen:

   ```markdown
   # Økt YYYY-MM-DD: <tema>

   - **Branch:** `<branch>`
   - **Story/oppgave:** <story-ID eller "–">
   - **Promptlogg:** [prompts/YYYY-MM-DD.md](../prompts/YYYY-MM-DD.md) (kl. HH:MM–HH:MM)
   - **Transkripsjon:** [transcripts/<dato>-<økt-ID>.md](../transcripts/<dato>-<økt-ID>.md)

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

4. **Beslutninger:** For hvert reelt valg om teknologi, arkitektur, omfang eller arbeidsform i økten, foreslå en ny `D-xxx`-oppføring i `docs/process/decisions.md` etter malen der. Oppdater status på eksisterende oppføringer hvis økten avgjorde en åpen beslutning.

5. **Vis utkastet** (øktlogg + endringer i decisions.md) til brukeren og **vent på godkjenning**. Skriv filene når utkastet er godkjent.

6. **Secret-scan, commit og push**
   1. List prosessfilene som er endret eller nye: `git status --porcelain --untracked-files=all -- docs/process` (hopp over slettede filer).
   2. Kjør `python3 .claude/hooks/redact.py --scan <filene>`. Hvis den avslutter med 1: **stopp**. Vis treffene (de er maskert i utskriften), ikke commit noe, og la brukeren rette filene.
   3. Branch: står du på en arbeidsbranch, commit der. Står du på `main`, lag `docs/wrap-up-<dato>-<økt-ID>` først (aldri commit til `main`).
   4. `git add docs/process` og commit **bare** prosessfiler: `docs(process): øktlogg <tema> [S-<epic>.<story>]` (utelat story-taggen hvis økten ikke hører til en story). Andre ucommittede endringer lar du ligge og nevner for brukeren.
   5. Sjekk push-tilgang: `gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push'`. Er svaret ikke `true`, stopp og si fra.
   6. `git push -u origin <branch>`. Hvis branchen ble laget i punkt 3, åpne en PR mot `main` med `gh pr create`, men ikke merge den.
   7. Rapporter commit-hash, branch og eventuell PR-lenke. Nevn transkripsjoner fra tidligere økter som ble committet nå (skrevet av hooken fordi `/wrap-up` ikke ble kjørt).

## Regler
- Skriv bare det som faktisk skjedde. Ikke finn på avvisninger, feil eller begrunnelser; spør brukeren hvis begrunnelsen for et valg er uklar.
- Ikke lag transkripsjoner eller logger for tidligere økter i ettertid; logger skal ikke etterkonstrueres.
- Ingen hemmeligheter, tokens eller innhold fra `.env` i loggen.
- Norsk språk (se D-003).
