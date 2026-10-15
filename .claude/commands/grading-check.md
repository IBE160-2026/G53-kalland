---
description: Egenvurdering av repoet mot de sju kriteriene i sensorveiledningen (del 1)
argument-hint: "[--no-save]"
---

Vurder repoet slik sensor vil gjøre det, mot kriteriene i `docs/process/vurderingskriterier.md`. Les den filen først. Dette er en **lesekontroll**: ikke endre kode eller dokumenter, bortsett fra å lagre rapporten til slutt.

Argumenter: $ARGUMENTS

## 1. Samle bevis

Kjør og noter resultatet (tilpass kommandoene hvis noe ikke finnes ennå):

**Historikk og arbeidsflyt (kriterium 1)**
- `git log --format='%h %ad %an %s' --date=short` – fordeling over tid, meldingskvalitet, story-referanser.
- Commits per uke: `git log --format='%ad' --date=format:'%G-W%V' | sort | uniq -c`.
- Store commits: `git log --shortstat --format='%h %s'` – flagg commits med svært mange endrede linjer.
- `git branch -a`, og `gh pr list --state all --limit 50` og `gh issue list --state all --limit 50` hvis `gh` er tilgjengelig.
- BMad-dokumenter i `_bmad-output/`: er de endret etter at de ble opprettet? (`git log --follow --format='%h %ad' --date=short -- <fil>`)
- Promptlogger i `docs/process/prompts/`, øktlogger i `docs/process/sessions/`, `docs/process/decisions.md`: finnes de, er de oppdatert, og refererer de til konkrete commits?

**Funksjonalitet (2)** – sammenlign kjerneflytene i brief/PRD med det som finnes i koden og README. Er avvik begrunnet i `decisions.md`?

**Testing (3)** – finn testfiler og testkommando; kjør testene hvis README beskriver hvordan. Finnes spor av review av KI-kode (PR-kommentarer, øktlogger med "Feil funnet")?

**Design (4)** – finnes UX-dokumenter, skisser eller skjermbilder? Stikkprøv tilgjengelighet i komponenter (labels, alt-tekst).

**Kode (5)** – samsvarer mappestrukturen med arkitekturdokumentet? Finnes linter/formatter-konfig? Søk etter utkommentert kode og `TODO`/`FIXME`.

**README (6)** – sjekk at README har: beskrivelse, forutsetninger med versjoner, installasjon, oppstart, miljøvariabler + `.env.example`, testkommando, mappeoversikt, lenke til `docs/process/`. Sjekk at kommandoene i README finnes (f.eks. scripts i `package.json`).

**Ryddighet (7)**
- `git ls-files | grep -Ei '(^|/)\.env($|\.)|node_modules/|(^|/)venv/|\.venv/|(^|/)(dist|build|\.next)/'` (unntatt `.env.example`).
- Søk etter hemmeligheter i sporede filer: `git grep -nIE '(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)'`.
- Løse filer i rotmappen: `git ls-files | grep -v /`.
- Store binærfiler: filer over 1 MB blant `git ls-files`.

## 2. Vurder

For hvert kriterium: gi en **anslått bokstavkarakter**, 1–3 linjer begrunnelse med konkret bevis (filsti, commit-hash, kommando-output) og hva som skal til for neste nivå. Bruk kjennetegnene for A–B / C / D–E / F i sammendraget. Vær streng: hvis noe ikke finnes ennå, vurder det som det er nå, og si at det er forventet i denne fasen.

Regn ut vektet skår (A=5 … F=0; vekter 0,30 / 0,20 / 0,15 / 0,10 / 0,10 / 0,10 / 0,05) og delkarakter (A ≥ 4,5 · B ≥ 3,5 · C ≥ 2,5 · D ≥ 1,5 · E ≥ 0,5).

List alle **varseltegn** som slår til.

## 3. Rapport

Vis rapporten i terminalen:

```markdown
# Egenvurdering YYYY-MM-DD (commit `<hash>`, branch `<branch>`)

| # | Kriterium | Vekt | Anslag | Bevis | For å nå neste nivå |
|---|---|---|---|---|---|
...
**Vektet skår:** x,xx → <karakter>

## Varseltegn
## Tre viktigste tiltak nå
```

Med mindre argumentet `--no-save` er gitt: lagre rapporten som `docs/process/grading-checks/YYYY-MM-DD.md` (legg til `-2` osv. hvis filen finnes), og sammenlign kort med forrige rapport i mappen hvis det finnes en.
