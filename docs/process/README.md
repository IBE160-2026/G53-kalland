# Prosessdokumentasjon

Spor av hvordan appen er planlagt, bygget og kvalitetssikret med KI.

| Hva | Hvor | Hvordan det lages |
|---|---|---|
| Vurderingskriterier (sammendrag) | [`vurderingskriterier.md`](vurderingskriterier.md) | Manuelt |
| Beslutningslogg | [`decisions.md`](decisions.md) | Manuelt og via `/log-session` |
| Promptlogg per dag | [`prompts/`](prompts/) | Automatisk, hook `.claude/hooks/log-prompt.py` |
| Øktoppsummeringer | [`sessions/`](sessions/) | `/log-session` etter hver arbeidsøkt |
| Egenvurderinger mot kriteriene | `grading-checks/` | `/grading-check` ukentlig og før frist |
| Planleggingsdokumenter (BMad) | [`../../_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) | BMad-skills |

**Slik henger det sammen:** en prompt i `prompts/` → oppsummert med vurdering av KI-forslaget i `sessions/` → commit/PR som refererer story-ID → eventuelle valg i `decisions.md`.
