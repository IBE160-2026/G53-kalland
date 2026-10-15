# Vurderingskriterier – Del 1 (applikasjon og prosess)

Sammendrag av *Sensorveiledning – Del 1, IBE160 Programmering med KI, høst 2026*. Del 1 teller **70 %** av samlet karakter; refleksjonsrapporten (del 2) teller 30 %. Originalen er emnemateriell og versjoneres ikke i repoet (se [D-004](decisions.md#d-004)).

Sensor kloner repoet og sjekker ut **siste commit før fristen**, følger README på en ren maskin (ca. 15–20 min innsats), tester appen, leser historikk, prosessdokumenter og kode, og kjører testene.

## Kriterier og vekt

| # | Kriterium | Vekt | Hva det betyr for oss |
|---|---|---|---|
| 1 | Prosess og KI-styring | **30 %** | Se under |
| 2 | Funksjonalitet og omfang | 20 % | Se under |
| 3 | Kvalitetssikring og testing | 15 % | Se under |
| 4 | Design og brukeropplevelse | 10 % | Se under |
| 5 | Kodekvalitet og arkitektur | 10 % | Se under |
| 6 | README og kjørbarhet | 10 % | Se under |
| 7 | Ryddighet i repoet | 5 % | Se under |

Kriterium 1, 6 og 7 (prosess og etterprøvbarhet) utgjør 45 %; 2–5 (produktet) utgjør 55 %.

### 1. Prosess og KI-styring (30 %)
- BMad-dokumentene (brief, PRD, arkitektur, epics/stories) skal **brukes og oppdateres**, ikke genereres én gang.
- Kode skal kunne spores til krav og stories; avvik fra planen forklares.
- Jevn commit-historikk over tid, små commits med beskrivende meldinger. Branches, PR-er og issues.
- Lagrede prompts og KI-økter, med **konkrete eksempler på at vi presiserte, avviste eller rettet KI-forslag**.
- Begrunnede beslutninger om teknologi og arkitektur.
- **A–B:** prosessen kan følges fra plan til app; prompts og beslutninger er koblet til konkrete endringer. **C:** sporbar, men koblingen til kode er delvis implisitt.

### 2. Funksjonalitet og omfang (20 %)
- Kjerneflytene fra brief og README virker fra start til slutt.
- Tåler feil input og gjentatte handlinger uten å krasje.
- Det som er utelatt eller endret fra brief/proposal er beskrevet og begrunnet.
- Kan ikke appen kjøres, begrenses denne karakteren tydelig.

### 3. Kvalitetssikring og testing (15 %)
- Automatiserte tester som kjøres etter README og tester meningsfull logikk.
- Manuelle testplaner der automatiske tester ikke passer.
- Spor av kodegjennomgang: PR-kommentarer, beskrevne feil i KI-kode og hvordan de ble rettet.
- Feilhåndtering, inputvalidering, ingen hemmeligheter i koden.

### 4. Design og brukeropplevelse (10 %)
- Konsistent visuelt uttrykk, tydelig navigasjon, forståelige feilmeldinger og tomtilstander.
- Grunnleggende tilgjengelighet: kontrast, tastatur, alt-tekst, skjemaetiketter. Responsivt.
- Spor av designarbeid (skisser, wireframes, UX-dokument).

### 5. Kodekvalitet og arkitektur (10 %)
- Mappestruktur som samsvarer med arkitekturdokumentet.
- Lesbare navn, lite duplisering, **ingen død kode eller utkommenterte rester fra KI-forsøk**.
- Linter/formatterer, fornuftig håndtering av konfigurasjon og avhengigheter.

### 6. README og kjørbarhet (10 %)
- Hva appen gjør og for hvem (gjerne skjermbilde).
- Forutsetninger med versjoner; eksakte kommandoer for installasjon og oppstart.
- Miljøvariabler med `.env.example`; testdata/testbrukere; hvordan testene kjøres.
- Mappeoversikt og lenker til planleggings- og prosessdokumentasjon. Oppdatert, ikke en mal.
- Mangler en vanlig bruker ikke kan løse via README regnes som README-feil.

### 7. Ryddighet i repoet (5 %)
- Tydelig skille mellom kode, dokumentasjon og ressurser.
- `.gitignore` holder ute byggeartefakter, avhengigheter og lokale filer.
- **Ingen hemmeligheter i repo eller historikk.** Ingen løse filer i rotmappen.

## Varseltegn sensor ser etter
- Nesten all kode i én eller noen få commits rett før fristen.
- Planleggingsdokumenter som beskriver en annen app, eller som tydelig er laget i etterkant.
- README er en uendret mal, eller kommandoene virker ikke.
- API-nøkler, passord eller `.env` committet; `node_modules`, `venv`, build-mapper eller store binærfiler i repoet.
- Tester som feiler eller bare tester trivielle ting.
- Død kode, dupliserte filer, rester fra forkastede KI-forsøk.
- **KI-dokumentasjon som er generell og ikke kan knyttes til konkrete endringer.**

## Karakterberegning
Bokstav per kriterium → tall (A=5, B=4, C=3, D=2, E=1, F=0), ganges med vekten og summeres.
Terskler: **A ≥ 4,5 · B ≥ 3,5 · C ≥ 2,5 · D ≥ 1,5 · E ≥ 0,5 · F < 0,5**.
Eksempel: (B, C, C, A, C, B, D) → 0,30·4 + 0,20·3 + 0,15·3 + 0,10·5 + 0,10·3 + 0,10·4 + 0,05·2 = 3,55 → B.
Sensor kan avvike fra beregningen ved begrunnet helhetsinntrykk.
