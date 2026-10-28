---
title: 'Technical research: Claude Code CLI as server-side image metadata provider'
type: 'technical'
topic: 'Claude Code CLI as server-side image metadata provider'
decision: 'Which real AI metadata provider v1 ships next to the mock provider'
source: 'native run (web), inline, no subagents'
status: complete
preset: 'standard'
validation: 'normal'
created: '2026-10-28'
updated: '2026-10-28'
claims: 'verified 5, unverified 4, disputed 1, overturned 0'
---

# Technical research: Claude Code CLI as server-side image metadata provider

**Decision this research serves:** which real AI metadata provider v1 ships next to the mock provider, before the PRD.

## Executive summary

**Don't ship the Claude Code CLI on a subscription login as v1's real provider. Ship the Claude API instead, with an API key, a small vision model (Claude Haiku 5.5) and the official SDK.** Keep the mock as the default.

The three findings that decide it:

1. **The CLI fails gate G2 (terms).** Anthropic says subscription (OAuth) login is "designed to support ordinary use of Claude Code". It says developers building products or services "should use API key authentication", and that it may enforce this without notice [2]. A web app's backend that calls the CLI automatically on every upload, for a service clients use, is a product. It is not ordinary use of Claude Code.
2. **The cost argument for the CLI is now gone.** Since October 2026, Max and Team plans include monthly API credits: $100–$200 on Max and up to $500 pooled on Team. They are used through an API key from a linked Console organisation [3]. If the agency's plan is Max or Team, the API route costs it nothing extra. A ~1000 px image on Haiku 5.5 costs about $0.0003, or about $0.15 per 500 images [4][6].
3. **The API is also the simpler build.** It gives direct image input (base64), JSON-schema output, and clear HTTP errors for the "AI failure doesn't block" rule. It needs no CLI binary or login on the server. The CLI has no documented way to pass an image straight to the model. It would have to go through an agent turn using the Read tool, and that path has had bugs [1][5].

**Biggest caveat:** no source measures Norwegian-language keyword or alt-text quality for any candidate. Run a small pilot of about 20 sample images before committing a model in the architecture.

## D1 – CLI headless mechanics

`claude -p` runs non-interactively. It exits with a non-zero code on failure, and `--output-format json --json-schema` returns schema-conforming output in a `structured_output` field. Callers must check that field is present, because it's missing when the run fails or Claude declines [1]. The docs recommend `--bare` for scripted calls. In that mode the CLI **does not use the subscription login at all** and needs `ANTHROPIC_API_KEY` [1]. So even Anthropic's recommended scripting setup sends you to an API key.

The headless docs don't mention images. The only route is a prompt that names a file path plus `--allowedTools Read`, which makes the agent read the image as a tool call. Two GitHub issues report that this path once failed. Both are marked resolved, but current behaviour is unconfirmed (low confidence) [5]. Each call also starts a CLI process and an agent loop. No published latency or concurrency figures were found, and none were measured here.

## D2 – Subscription limits and terms

Claude Code falls under the Consumer Terms on Free/Pro/Max and the Commercial Terms on Team/Enterprise/API [2]. The authentication section is the deciding text [2]:

- OAuth (subscription) login "is intended exclusively for purchasers of … subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications."
- "Developers building products or services that interact with Claude's capabilities, including those using the Agent SDK, should use API key authentication through Claude Console or a supported cloud provider."
- "Advertised usage limits for Pro and Max plans assume ordinary, individual usage."

Signed-in `claude -p` usage still draws on the subscription's limits. A planned change to this was paused on 2026-06-15 (medium confidence) [11]. Since October 2026, Max and Team plans include monthly API credits. They cover the Claude API and the Agent SDK through a key from a linked Console organisation, they don't cover Claude Code subscription use, and they expire every billing cycle [3].

**Grey zone, stated honestly:** the terms don't name the exact case of a subscriber running the CLI on its own server for its own staff. "Ordinary use", "products or services" and the right to enforce without notice all point the same way. A course project shouldn't build its real provider on a reading Anthropic can reject at any time.

## D3 – Privacy and retention

- **Claude API:** "Anthropic does not use uploaded images to train models." Images aren't stored beyond the request [4]. Commercial API data isn't used for training by default [8].
- **Retention of API inputs and outputs:** Anthropic's privacy page (dated 2026-07-01) says 30 days. Secondary sources report 7 days since September 2025, and the contract governs either way. This is **disputed** [7].
- **CLI on a Pro/Max login:** consumer privacy terms apply, including a training setting the user controls [7]. This is weaker for client images than the commercial API.
- **Gemini API:** free-tier content *is* used to improve Google products; paid-tier content isn't [9]. Never use the free tier with real agency images.
- **Ollama:** inference runs locally, so images never leave the machine.

## D4 – Alternatives

| Candidate | Image input / structured output | Price (input / output per MTok) | Notes |
|---|---|---|---|
| **Claude API, Haiku 5.5** | base64/URL/Files API; JPEG/PNG/GIF/WebP, ≤10 MB; JSON output [4] | $0.10 / $0.50; Batch −50 % [6] | ~1,300 tokens for a 1000×1000 image [4]. Doesn't read embedded metadata, and refuses to name people [4], so the app supplies EXIF/IPTC context in the prompt |
| Claude Agent SDK (API key) | Same model access, plus a tool and agent loop | Same as API | An agent loop isn't needed for one call per image. Overkill |
| Gemini 3.1 Flash-Lite (paid) | Image input | $0.25 / $1.50 [9] | Gemini 3.6/3.8 Flash cost $0.75/$3.75 until 2026-12-31, then double [9]. A second vendor account |
| Ollama + Gemma (local) | JSON schema in `format` works with vision models; Gemma not confirmed [10] | Hardware only | Heavy on the server; never a requirement for the examiner |
| Claude Code CLI (subscription) | Indirect, via the Read tool [1][5] | Counts against plan limits | **Cut: fails G2** [2] |

## D5 – Verdict matrix

Scores run 1–5, multiplied by the agreed weights. Re-weight freely.

| Criterion (weight) | Claude API Haiku 5.5 | Gemini Flash-Lite (paid) | Agent SDK (key) | Ollama Gemma |
|---|---|---|---|---|
| Cost to agency (30) | 5 – covered by plan credits [3], ~$0.0003/image | 5 – ~$0.0009/image | 5 | 4 – hardware |
| Solo build effort by 5 Dec (25) | 5 – one HTTP call, official SDK | 4 – second vendor | 3 – agent loop not needed | 2 – install, model size, server load |
| Quality incl. Norwegian (20) | 4 – unverified | 4 – unverified | 4 | 3 – unverified, smaller model |
| Privacy (15) | 4 – no training; retention disputed [7][8] | 3 – free-tier trap [9] | 4 | 5 – local |
| Throughput (10) | 5 – concurrent calls, Batch API | 5 | 4 | 2 |
| **Weighted total (/500)** | **465** | **425** | **415** | **325** |

**Pick:** Claude API with Haiku 5.5, configured through `ANTHROPIC_API_KEY` in `.env` (documented in `.env.example`). The provider is selected by an environment variable, with `mock` as the default.

**Runner-up:** Gemini Flash-Lite on the paid tier. It wins if the agency doesn't have a Max or Team plan, so credits don't apply and it already pays Google, or if the Norwegian pilot shows clearly better keywords.

**Strongest argument against the pick:** the agency pays for Claude Code subscriptions precisely so it doesn't have to manage API billing. The API route adds a Console organisation and a key. The October 2026 credits answer most of this, but only on Max or Team.

**Cheapest reversibility hedge:** the provider interface already in the brief. Adding Gemini later is one new provider class.

## Cross-dimension insights

- D1 and D2 point the same way: even Anthropic's recommended scripting mode for the CLI (`--bare`) drops the subscription login. The CLI's only advantage, free use through the subscription, is exactly what the terms rule out for products.
- D2 and D4 together remove the brief's original reason for the CLI. The new plan credits make "costs the agency nothing per image" true of the API route as well.

## Recommendations

1. **Brief / PRD:** replace "Claude Code CLI provider" with a "Claude API provider (API key, Haiku-class vision model)". Keep the mock as the default and the examiner's path. Move the CLI providers in stage 2 (Codex, Gemini CLI) under the same terms caveat. *Confidence: high* (based on [2][3]).
2. **Decision log:** record this as a new `D-xxx` that cites this report, because it changes a brief decision.
3. **Before architecture:** run a pilot of about 20 sample images on Haiku 5.5 (and optionally Gemini Flash-Lite) to check Norwegian keyword and alt-text quality, and measure latency. *Confidence: the need is high; quality is unknown.*
4. **Architecture input:**
   - The API doesn't read embedded metadata, so send the extracted EXIF/IPTC fields as text in the prompt.
   - Resize images to ~1000–1568 px before sending, to control cost and payload [4].
   - Treat a missing or invalid JSON response as a provider failure, which means empty fields and the upload still succeeds.
5. **Ask the agency** which Claude plan it has (Pro/Max or Team). That decides whether the credits apply.

## Open questions

- Norwegian-language quality for each candidate: answered by the pilot above.
- Real latency per image and safe concurrency on the API: answered by the pilot.
- Anthropic API retention (7 vs 30 days): check the current Commercial Terms or DPA before the agency's real rollout in stage 2.
- Whether the agency's plan is Max or Team, which decides the credits: ask the agency.

## Source appendix

| # | Supports | Publisher | Pub date | Accessed | Confidence |
|---|---|---|---|---|---|
| [1] | `claude -p` JSON/schema output, `--bare` needs an API key, exit codes, stdin cap | [Anthropic – Run Claude Code programmatically](https://code.claude.com/docs/en/headless) | current docs (2026-10) | 2026-10-28 | high |
| [2] | Consumer vs Commercial Terms; OAuth for ordinary use; developers should use API keys; enforcement | [Anthropic – Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance) | current docs (2026-10) | 2026-10-28 | high |
| [3] | Monthly API credits for Max and Team plans | [Anthropic – API credits for Max and Team plans](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers); [Anthropic support 17154008](https://support.claude.com/en/articles/17154008-api-credits-for-max-and-team-plans) | 2026-10 | 2026-10-28 | high |
| [4] | Vision input methods, formats, size limits, token formula, no metadata reading, no training on images | [Anthropic – Vision](https://platform.claude.com/docs/en/build-with-claude/vision) | current docs | 2026-10-28 | high |
| [5] | Past Read-tool image failures in Claude Code | [GitHub – anthropics/claude-code #30925](https://github.com/anthropics/claude-code/issues/30925) | 2026 | 2026-10-28 | low |
| [6] | Claude Haiku 5.5 / Sonnet 5.5 prices, Batch discount | [Anthropic – Pricing](https://platform.claude.com/docs/en/about-claude/pricing) | current | 2026-10-28 | medium |
| [7] | API retention 30 days (disputed); consumer plans under separate terms | [Anthropic Privacy – data retention article](https://privacy.claude.com/en/articles/7996866-is-my-data-used-for-model-training) | 2026-07-01 | 2026-10-28 | low (disputed) |
| [8] | Commercial API data not used for training by default | [Anthropic support 7996875](https://support.anthropic.com/en/articles/7996875-can-you-delete-data-that-i-sent-via-api) | current | 2026-10-28 | high |
| [9] | Gemini Flash / Flash-Lite prices; free tier used to improve products | [Google – Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) | 2026-10-27 | 2026-10-28 | medium |
| [10] | Ollama structured outputs with vision models | [Ollama – Structured outputs](https://docs.ollama.com/capabilities/structured-outputs) | current docs | 2026-10-28 | medium |
| [11] | Agent SDK / `claude -p` still draw on subscription limits; change paused 2026-06-15 | [Anthropic support 15036540](https://support.claude.com/en/articles/15036540) | 2026-06 / 2026-10 | 2026-10-28 | medium |

## Staleness map

Computed with `recon_kit.py staleness`, using windows of versions 1 mo, pricing 3 mo, terms 3 mo and privacy 6 mo.

| Claim | Re-check by |
|---|---|
| `claude -p` image handling via Read [5] | **already stale**: re-test by hand if the CLI is ever reconsidered |
| `claude -p` JSON schema / `--bare` [1]; Ollama vision structured output [10] | 2026-11-01 |
| Terms on OAuth vs API key [2]; plan API credits [3]; Haiku and Gemini prices [6][9] | 2027-01-01 (note: Gemini Flash prices double on that date) |
| API retention [7] | 2027-01-01 |

The earliest re-check is **2026-11-01** (CLI flags), which matters only if the CLI comes back. For the pick, re-check pricing and terms before the stage 2 rollout. A selection report older than two quarters should be refreshed before anyone acts on it.
