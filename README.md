# G53 — Marthe

Solo project in **IBE160 Programmering med KI** (Programming with AI) at Molde University College, autumn 2026 (15 ECTS).

The repo contains the application and documentation of how it was developed, tested and quality-assured with AI.

## Member

- Marthe Kalland (solo project)

## Tests

The application has not been built yet. The process logging tools (`.claude/hooks/`) have tests that only need Python 3.10 or newer:

```bash
python3 -m unittest discover -s .claude/hooks/tests
```

## Process documentation

- [Process documentation – overview](docs/process/README.md)
- [Grading criteria (summary, English)](docs/process/vurderingskriterier.en.md) · [Norwegian original](docs/process/vurderingskriterier.md)
- [Decision log](docs/process/decisions.md)
- [Planning documents (BMad)](_bmad-output/planning-artifacts/)
- Conventions for AI-assisted development: [CLAUDE.md](CLAUDE.md)
