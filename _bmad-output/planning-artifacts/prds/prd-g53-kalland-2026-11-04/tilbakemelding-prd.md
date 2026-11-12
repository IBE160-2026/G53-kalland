# Tilbakemelding på PRD

| | |
|---|---|
| **Gruppe** | G53 – G53-kalland |
| **PRD vurdert** | `_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-04/prd.md` (status: final, sist endret 2026-11-04, commit 4184767), lest sammen med `addendum.md` |
| **Dato** | 2026-11-12 |
| **Type** | Formativ tilbakemelding, ikke karakter |

## 1. Samlet inntrykk

Dette er en uvanlig sterk PRD: tydelig tese, testbare FR-er, en tilgangstabell og kantregler som kan bli tester direkte, og ærlig håndtering av KI, kostnad og personvern. Den største risikoen er omfanget. Med 43 FR-er, en 16-punkts Rollout Gate og en solobygger før 2026-12-05 er det ikke avklart hvilke [v1]-krav som faller først.

## 2. Dette fungerer godt

- **Tilgangsmodellen er gjort om til tester.** Tilgangstabellen (A1–A13) og kantreglene (S1–S15) dekker hver kombinasjon av synlighet, pris og lisens, og SC-1 kobler dem til "the same routes users hit". Dette er et direkte grunnlag for stories og testplan.
- **KI-kontroll og kjørbarhet er gjennomtenkt.** FR-12 og FR-14 styrer prompt, sensitive egenskaper og utdatasjekk. FR-16 definerer feil og retry, og NFR-1 gir mock-modus med "a setting makes it fail on demand". Briefens to største hull (nøkkel for sensor og kostnad) er lukket.
- **Scope er ærlig og kuttbart.** "Spine and cut line" med fallback per FR og sjekkpunktet 2026-11-22 viser hva som skal skje hvis tiden ikke strekker til. Trade-offs-tabellen, f.eks. publisering uten alt-tekst som "NFR-5's known exception", viser hva dere har gitt opp.

## 3. Oversikt per dimensjon

| Dimensjon | Vurdering | Kort begrunnelse |
|---|---|---|
| Beslutningsklarhet | sterk | Valg står som valg, med pris: Trade-offs-tabellen og addendumets liste over brukerbeslutninger. |
| Substans | sterk | Ingen pynt. NFR-ene har tall (500 bilder, under 1 s, 800 px, 12 tegn), og tre personer bærer UJ-ene. |
| Strategisk sammenheng | god | Tesen "visibility × price plus a licence that lasts" er tydelig og styrer SC-1, men SC-ene måler testbarhet, ikke nytte for byrået (utsatt til RG-14). |
| Testbarhet | sterk | De fleste FR-er har konkrete konsekvenser. Noen få er tynne (se 4.4). |
| Scope og avgrensning | god | Non-goals, Out of Scope og fallbacks finnes. Men [v1]-listen er for stor og uten rekkefølge. |
| Brukbarhet for neste fase | god | ID-er og glossar er rene. FR-ene mangler henvisning til UJ-ene, og dokumentet er langt (ca. 8 100 ord). |
| Formtilpasning | god | UJ-ene passer en to-sidig portal. Rollout Gate er derimot nesten et eget dokument. |

## 4. Viktigste forbedringer

### 4.1 [v1]-kravene har ingen prioritert rekkefølge
- **Alvorlighet:** høy
- **Hvor:** Åpent spørsmål 1: "The [v1] FRs have no order among themselves."; Release Stages
- **Problem og hvorfor det betyr noe:** Sjekkpunktet 2026-11-22 sier at [v1]-FR-er bygges først etter at spinen kjører, men ikke hvilke som kommer først. Epics og sprintplan trenger denne rekkefølgen. Flere [v1]-krav er dyre for én person: FR-18 (låser med utløp og overtakelse, tre nivåer), FR-15 (bakgrunnsjobber som overlever omstart) og FR-31 (handlekurv).
- **Forslag:** Legg inn en liten tabell i Release Stages: *FR | tagg | rekkefølge | fallback hvis kuttet*. Eksempel: "FR-18 Edit locks | v1 | 9 av 14 | fallback: siste lagring vinner, med advarsel om at en annen redigerer". Sett en "minimum brukbar v1" (f.eks. FR-1 til FR-6, FR-8 til FR-12, FR-16, FR-17, FR-19, FR-21 til FR-23, FR-27 til FR-30, FR-32, FR-33, FR-41). Alt annet har rang og fallback.

### 4.2 Rollout Gate dominerer dokumentet
- **Alvorlighet:** medium
- **Hvor:** "Rollout Gate": "Nothing here is built by 2026-12-05." (RG-1 til RG-16)
- **Problem og hvorfor det betyr noe:** Seksjonen utgjør rundt en fjerdedel av PRD-en og går dypt i jus (overføringsgrunnlag, DPIA, aktuelle rettssaker). Den er verdifull, men ikke noe UX, arkitektur eller stories skal bygge på i v1. Den gjør det vanskeligere å se den ene tingen som må ferdig i år.
- **Forslag:** Flytt detaljene til addendumet eller en egen `rollout-gate.md`. La PRD-en beholde en kort liste (en linje per RG med tittel og eier) og de NFR-ene som faktisk påvirker v1 (NFR-3, NFR-9). Lenk til resten.

### 4.3 FR-ene peker ikke til UJ-ene, og innloggingen mangler reise
- **Alvorlighet:** medium
- **Hvor:** §User Journeys og alle FR-er (ingen "Realizes UJ-x"); UJ-3 steg 1: "He logs in with email and password."
- **Problem og hvorfor det betyr noe:** Stories skal spores til både FR og reise. Admin-oppgavene (FR-1 til FR-7, FR-25) og oppsettlenken (FR-4) har ingen reise, selv om Jonas ikke kan logge inn uten den.
- **Forslag:** Legg til "Realizes UJ-n" der det passer. Skriv en kort UJ-4: "Ida onboarder Fjordkaffe: oppretter klient og to kontakter, kopierer oppsettlenkene, Jonas setter passord. Kantsak: lenken er utløpt (S8)."

### 4.4 Noen FR-er og NFR-er har ikke testbare konsekvenser
- **Alvorlighet:** medium
- **Hvor:** FR-7 Client card, FR-15 ("Staff can browse the batch meanwhile"), FR-31 Cart, FR-38 Dashboard; NFR-7 "a clear message in plain English"; NFR-4 "about 10 s"
- **Problem og hvorfor det betyr noe:** Resten av PRD-en er testbar, så disse stikker seg ut og blir de som tolkes forskjellig i stories.
- **Forslag, FR-7:** "Klientkortet for Fjordkaffe viser 2 kontakter, bildene som er synlige for klienten og lisenshistorikken. Notater og kontoansvarlig vises bare for staff. En kontakt som åpner siden får 403 (S6)." For NFR-7: velg 3–4 feil og skriv selve meldingsteksten i en tabell, så kan testen sjekke den.

### 4.5 Antakelser og kuttlinje er spredt
- **Alvorlighet:** lav
- **Hvor:** Tagger som "[spine; side-by-side is cut-first]"; antakelsene AS-1 til AS-22 ligger bare i addendumet
- **Problem og hvorfor det betyr noe:** Sammensatte tagger gir uklare stories (hva er spine, hva er cut-first?). Leseren av PRD-en ser ikke hva som er antakelse.
- **Forslag:** Del slike FR-er i a/b-punkter (FR-10a, FR-10b) eller bruk tabellen fra 4.1. Legg en kort "Assumptions"-lenke til addendumet i dokumentformålet.

## 5. Mekaniske funn

- ID-er er sammenhengende og unike: FR-1 til FR-43, NFR-1 til NFR-10, SC-1 til SC-12, UJ-1 til UJ-3, RG-1 til RG-16, A1–A13, S1–S15. Kryssreferansene jeg sjekket, løser seg.
- Glossaret brukes konsekvent (Own image, Client copy, Staff copy, Agency fields). Ingen synonymer funnet.
- Ingen inline `[ASSUMPTION]`-tagger eller indeks i selve PRD-en; antakelsene er bekreftet og samlet i addendumet.
- Under "Success Criteria" heter listen over motmål "Counter-measures", ikke counter-metrics, og den har to punkter. Fint, men gi dem ID-er (SC-C1, SC-C2) så de kan refereres.
- Ingen sensitive opplysninger funnet.

## 6. Før dere går videre

**Må avklares før UX, arkitektur og epics:**
- Rangering av [v1]-FR-ene og timene dere faktisk har (åpent spørsmål 1, punkt 4.1).
- Støttede operativsystemer og testing på Windows (addendum, Metadata contract), siden NFR-1 krever "a clean machine".
- Hvordan IIM-verdier forkortes (byte-grenser, æøå), som addendumet selv kaller en arkitekturbeslutning.

**Kan vente:** åpne spørsmål 2, 4 og 5, prompt v3-sjekken (spørsmål 3, når Claude-leverandøren bygges) og alle RG-punkter.

**Oppfølging av briefen:** *delvis*. Mock-modus, eksempelbilder, sjekkbare suksesskriterier (tilgang, duplikat, logg) og utsatt versjonering er fulgt opp. Anbefalingen om å smale inn v1 er bare delvis fulgt: kjerneflyten er tydelig, men D-022 la til handlekurv, staff-kontoer, låser, ZIP og dashboard.

## 7. Refleksjonsspørsmål

1. Rollout Gate refererer til rettssaker og leverandørvilkår. Hvordan kontrollerte dere at KI-en ikke bygde på feil eller utdaterte opplysninger, og hva endret dere etter kontrollen?
2. Hvis dere bare hadde halvparten av timene, hvilke ti FR-er ville dere kuttet, og hvilket krav i PRD-en støtter valget?

_Vurdert mot kvalitetsrubrikken i bmad-prd. Dette er veiledning, ikke sensur._
