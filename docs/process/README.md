# Prosessdokumentasjon

Spor av hvordan appen er planlagt, bygget og kvalitetssikret med KI.

| Hva | Hvor | Hvordan det lages |
|---|---|---|
| Vurderingskriterier (sammendrag) | [`vurderingskriterier.md`](vurderingskriterier.md) | Manuelt |
| Beslutningslogg | [`decisions.md`](decisions.md) | Manuelt og via `/wrap-up` |
| Promptlogg per dag | [`prompts/`](prompts/) | Automatisk, hook `.claude/hooks/log-prompt.py` |
| Transkripsjoner per økt | [`transcripts/`](transcripts/) | `/wrap-up` via `.claude/hooks/transcript-to-md.py`; SessionEnd-hook som sikkerhetsnett hvis `/wrap-up` ikke ble kjørt |
| Øktoppsummeringer | [`sessions/`](sessions/) | `/wrap-up` ved slutten av hver arbeidsøkt |
| Egenvurderinger mot kriteriene | `grading-checks/` | `/grading-check` ukentlig og før frist |
| Planleggingsdokumenter (BMad) | [`../../_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) | BMad-skills |

**Slik henger det sammen:** en prompt i `prompts/` → hele samtalen i `transcripts/` → oppsummert med vurdering av KI-forslaget i `sessions/` → commit/PR som refererer story-ID → eventuelle valg i `decisions.md`.
