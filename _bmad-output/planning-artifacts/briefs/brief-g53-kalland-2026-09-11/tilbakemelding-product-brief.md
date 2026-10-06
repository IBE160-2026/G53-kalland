# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G53 – G53-kalland |
| **Product brief** | `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/brief.md` (commit 176a867), lest sammen med `addendum.md` i samme mappe |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

**Det som er bra:**

1. Problemet er ekte og konkret: ansatte i et designbyrå bruker tid på å lete i en ustrukturert bildebank, og kunder må sende e-post for å få bilder de allerede har rett til. At løsningen skal brukes av byrået etterpå, gir dere tilgang til reelle brukere og tilbakemeldinger.
2. Tilgangsmodellen med to uavhengige egenskaper – synlighet (offentlig / begrenset / intern) × pris (gratis / engangskjøp) – er et elegant og testbart valg. Det er også bra at addendumet dokumenterer at modellen ble rettet underveis, og at dere er ærlige om at KI-generert metadata er standard og ikke et konkurransefortrinn.

**De viktigste endringene:**

1. V1 er stor for én person: CRM, DAM med KI-metadata, duplikatkontroll med hashing, versjonering, kjøp med logg, kundeportal med to nivåer av merkevaretilpasning, sikkerhetskopi og tenant-forberedelse. Velg kjerneflyten og flytt resten til senere trinn.
2. KI-metadata krever et bilde-API (språkmodell med bildeforståelse), som koster penger og krever nøkkel. Briefen sier ikke hvordan sensor kan kjøre appen uten deres nøkkel. Legg inn en plan for testmodus eller mock-svar.
3. To suksesskriterier kan ikke testes i emnet: «meningsfullt raskere» (ingen baseline) og «kan utvides senere uten omskriving». Erstatt dem med konkrete, sjekkbare kriterier.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Vanskelig**

**Sammenlignbart med:** KI-delen alene ligner 6) To-do-liste med smarte etiketter (enkel) – KI foreslår tittel og nøkkelord. Men to brukergrupper med innlogging, tilgangsstyring per bilde, kjøp og filhåndtering gjør prosjektet klart mer krevende enn 2) AI CV- og søknadsassistent (middels).

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Middels | Synlighet × pris avgjør hva hver kunde ser, kan laste ned og må betale for. Reglene er få og tydelige, men må stemme hver gang. |
| Datamodell – antall entiteter og relasjoner mellom dem | Høy | Tenant, kunde, bilde, versjon, synlighetsliste, kjøp, nedlasting og merkevareprofil, med mange-til-mange-relasjoner. |
| Brukere, roller og innlogging | Høy | Administrator og kunder med hver sin portal og tilgangsstyring per bilde. En feil her betyr at kunder ser hverandres bilder. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Middels | Én avgrenset KI-funksjon (metadata ved opplasting). Krever bildeforståelse og håndtering av feil eller dårlige forslag. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Middels | Språkmodell-API i v1. Tripletex er riktig nok utsatt, og det er bra at kjøp bare logges og ikke krever betalingsløsning. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Lav | Lite samtidighet, men opplasting av ny versjon må ikke ødelegge kjøpshistorikk. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Høy | Bildeopplasting, lagring, nedlasting, perseptuell hashing for nesten-duplikater, versjoner og sikkerhetskopi av filer og database. |
| Sikkerhet og personvern | Høy | Tilgangskontroll per kunde, og bilder kan vise personer. Byråets ekte bilder kan ikke legges i et offentlig repo. |

**Hva vanskelighetsgraden betyr for dere:**

- _Vanskelig:_ Et vanskelig prosjekt gir større mulighet for toppkarakter, men også større risiko. Definer en minimal versjon som sikkert kan bli ferdig, og legg resten i tydelige trinn etterpå. Her er den minimale versjonen allerede beskrevet i deres eget suksesskriterium om ende-til-ende-flyten: last opp → KI-metadata → sett synlighet og pris → kunden ser og laster ned eller kjøper → kjøpet logges.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | Risiko | Kjerneflyten er realistisk. Alt i «In»-listen samtidig, for én person med BMAD-flyten i tillegg, er det neppe. Versjonering, nesten-duplikater, merkevaretilpasning og sikkerhetskopi bør vente. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | OK | Briefen og addendumet er konkrete, med datamodell for tilgang og tydelige utsatte funksjoner. Det blir lett å lage PRD og stories. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | Webapp med opplasting, innlogging og database passer Claude Code godt. Hold dere til én vanlig stakk og lokal fillagring. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | OK | Dere kjenner domenet fra byrået og kan selv vurdere om tilgangsregler og metadata blir riktige. Tilgangsreglene bør likevel testes systematisk. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | OK | Synlighet × pris gir en tydelig testmatrise (f.eks. kunde A ser ikke bilde begrenset til kunde B). Duplikatkontroll kan testes med kjente filer. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Risiko | Ikke beskrevet. Sensor trenger testbrukere (admin og to kunder), fiktive eller fritt lisensierte bilder og en måte å kjøre uten deres API-nøkkel. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Risiko | Bildeforståelse via språkmodell koster per bilde. Med ~500 testbilder blir det merkbart. Planlegg mock-modus og at metadata kan fylles inn manuelt når KI ikke er tilgjengelig. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart med justert omfang.** Se forslagene under.

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. V1: kunderegister, opplasting med KI-metadata og manuell redigering, eksakt duplikatkontroll (filhash), synlighet × pris, kundeportal med søk, nedlasting og kjøp med logg. Flytt versjonering, nesten-duplikater (perseptuell hash), merkevaretilpasning per kunde og automatisk sikkerhetskopi til trinn 2.
2. Behold `tenant_id` i datamodellen hvis det er enkelt, men ikke bruk tid på flerleietaker-forberedelser utover det. Det gir lite synlig funksjonalitet i v1.
3. Legg inn en mock-modus for KI-metadata og et sett med fritt lisensierte eksempelbilder i repoet, slik at både tester og sensor kan kjøre hele flyten uten nøkkel.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Klart: intern bildebank med KI-metadata og en lukket kundeportal for nedlasting og kjøp. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Konkret og basert på et faktisk byrå. Ærlig om at det ikke finnes noen baseline for tidsbruk. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | OK | Beskriver hva ansatte og kunder gjør, med gode eksempler på tilgangsmodellen. Avsnittet om tenant er mer arkitektur enn brukeropplevelse og kan flyttes til addendum. |
| What Makes This Different – er vurderingen ærlig og realistisk? | OK | Ærlig og godt underbygd med sammenligning mot Bynder, Brandfolder, Canto og Cloudinary. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | OK | Tydelig primærbruker (byråets ansatte) og sekundærbruker (kunder), med behov beskrevet. Unngå å navngi personer i briefen siden repoet er offentlig. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Juster | Ende-til-ende-kriteriet og «kunden klarer seg uten e-post» er gode. «Meningsfullt raskere», «forsvarlig som IBE160-leveranse» og «kan utvides uten omskriving» kan ikke testes. Legg til f.eks. «en kunde ser aldri et bilde som er begrenset til en annen kunde» og «opplasting av en identisk fil blir avvist med melding». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | Juster | Svært tydelig «In» og «Out», med begrunnelse for hvert utsatt punkt. «In» er likevel for stor for én person; se forslagene over. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Realistisk og holdt adskilt fra v1. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | OK | Briefen er presis nok til å bygge PRD og stories på. Historikken har foreløpig bare én commit for BMAD og brief; arbeid videre i mindre, jevnlige commits. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Juster | Tydelig kjerneflyt med mye reell funksjonalitet. Smal inn «In» slik at kjerneflyten blir stabil. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Juster | Tilgangsmodellen og duplikatkontrollen gir gode testtilfeller. Gjør suksesskriteriene sjekkbare, og test tilgangsreglene systematisk. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | OK | To tydelige brukergrupper og en ekte bruker å teste designet på. Skisser opplastingsflyten og kundeportalen tidlig. KI-generert alt-tekst er et godt bidrag til universell utforming. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | Juster | Modulær arkitektur og tenant-forberedelse er gjennomtenkt, men kan gjøre v1 mer kompleks enn nødvendig. Hold det enkelt. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Juster | Planlegg lokal kjøring med testbrukere, eksempelbilder, `.env.example` og mock-modus for KI. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Byråets ekte bilder og kundedata skal ikke inn i det offentlige repoet. Opplastede filer og API-nøkler må holdes utenfor git. |

## 3. Neste steg for gruppen

1. Smal inn «In» til kjerneflyten, og flytt versjonering, nesten-duplikater, kundespesifikk merkevaretilpasning og sikkerhetskopi til en liste over senere trinn.
2. Bestem hvilken språkmodell som skal lage metadata, og beskriv kostnad, mock-modus og hvordan sensor kjører appen uten nøkkel.
3. Erstatt de utestbare suksesskriteriene med sjekkbare kriterier for tilgang, duplikater og kjøpslogg.
4. Gå videre til PRD, og legg tidlig inn testbrukere og fritt lisensierte eksempelbilder.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
