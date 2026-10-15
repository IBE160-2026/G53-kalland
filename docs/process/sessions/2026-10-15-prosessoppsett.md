# Økt 2026-10-15: Prosessoppsett mot sensorveiledningen

- **Branch:** `chore/process-setup`
- **Story/oppgave:** – (oppsett, ingen story)
- **Promptlogg:** [prompts/2026-10-15.md](../prompts/2026-10-15.md)

## Mål
Sette opp repoet slik at arbeidet etterlater sporene sensorveiledningen for del 1 ser etter: konvensjoner, kriteriesammendrag, automatisk promptlogging, kommandoer for øktlogg og egenvurdering, og beslutningslogg.

## Viktigste prompts
1. Be Claude hente siste versjon, lese sensorveiledningen og foreslå et oppsett – **plan først, ingenting opprettes før godkjenning**.
2. Godkjenne planen med endringer: branch + PR, gi PDF-en nytt navn, **PDF-en skal ikke pushes**, og prosjektet er solo.

## KI-forslag og vår vurdering
| KI foreslo | Vi gjorde | Hvorfor |
|---|---|---|
| Plan med CLAUDE.md, kriteriesammendrag, hook, `/log-session`, `/grading-check`, beslutningslogg | Akseptert | Dekker kriterium 1, 3, 6 og 7 |
| Committe full promptlogg (med maskering) i stedet for kun lokalt | Akseptert | Sterkest bevis for sporbar KI-bruk |
| Gi PDF-en nytt navn uten mellomrom | Akseptert, **justert**: PDF-en skal ikke versjoneres i det hele tatt; sammendraget erstatter den | Emnemateriell, ikke vårt arbeid (D-004) |
| Spørsmål om README-medlemsliste / samarbeid | Avklart: soloprosjekt, README oppdatert | Kriteriet om samarbeid tolkes for én person |

## Feil funnet i KI-generert kode
Ingen. Hooken ble testet i en isolert mappe med en prompt som inneholdt falske nøkler, en `password:`-linje og en kodeblokk med ```` ``` ````; nøklene ble maskert, markdown holdt seg intakt, og ugyldig input ga exit 0 uten logging.

## Commits
Se PR for `chore/process-setup`.

## Beslutninger
- [D-002](../decisions.md) Automatisk promptlogging via hook, committet med maskering
- [D-003](../decisions.md) Norsk prosessdokumentasjon, engelske BMad-artefakter
- [D-004](../decisions.md) Sensorveiledningen versjoneres ikke
- [D-005](../decisions.md) Branch og PR også som soloprosjekt
- [D-006](../decisions.md) Avgrensning av V1 – **åpen**

## Neste steg
- Ta stilling til D-006 (avgrensning av V1, mock for KI-tjenesten, testbare suksesskriterier) og oppdater product brief.
- Fortsett med PRD (`bmad-prd`).
- Kjør `/grading-check` for å få et første utgangspunkt.
