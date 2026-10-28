# D1 CLI headless mechanics — round 1 digest (accessed 2026-10-28)

- claim: `claude -p` runs non-interactively; exit 0 on success, non-zero on failure; in-run failures (e.g. missing auth) are printed as the result on stdout. | src: code.claude.com/docs/en/headless | Anthropic | pub: current docs | conf: high | class: version/compat
- claim: `--output-format json --json-schema '<schema>'` returns schema-conforming output in a `structured_output` field; if the run ends without valid structured output the field is absent and callers must check for it. | same src | high
- claim: `--bare` is the recommended mode for scripted/SDK calls and "doesn't use your subscription login" — it never reads OAuth credentials; it needs ANTHROPIC_API_KEY or apiKeyHelper. | same src | high
- claim: piped stdin capped at 10 MB; for larger inputs write a file and reference the path in the prompt. | same src | high
- claim: JSON output includes `total_cost_usd` (client-side estimate). | same src | high
- gap: headless docs say nothing about image input. Images would go via the agent's Read tool (prompt names a file path + `--allowedTools Read`), i.e. an agent turn with tool use, not a direct vision call. GitHub issues (#30925, #18588) report past Read-on-image failures, marked resolved; current behaviour unconfirmed. | src: github.com/anthropics/claude-code/issues/30925 | conf: low
- gap: no published latency or concurrency figures for `claude -p`; each call spawns a CLI process plus an agent loop. Not measured in this run.
