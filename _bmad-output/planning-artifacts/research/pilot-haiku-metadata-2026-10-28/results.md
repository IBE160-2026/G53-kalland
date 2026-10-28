---
title: "Pilot results: Claude Haiku 5.5 for Norwegian image metadata"
status: complete
created: 2026-10-28
---

# Pilot results: Claude Haiku 5.5 for Norwegian image metadata

Results of the [pilot plan](pilot-plan.md), run on 2026-10-28 with the 20 images in [sources.md](sources.md). The runner is [`run_pilot.py`](run_pilot.py). Each run in `runs/<timestamp>/` holds the exact prompt (`prompt.md`), the metadata sent and the parsed answer per image, the raw API responses (`raw/`) and `summary.csv`.

## Verdict

**Go for v1: Claude Haiku 5.5 at effort `medium` with prompt v2.** The user accepted the median latency of 5.9 s, which is above the plan's target of about 5 s. Gemini Flash is to be tested later, if there is time, since it may be both better and faster. The app must let the agency choose the AI provider, so adding Gemini or a local model later does not mean a rewrite (see [Input to the architecture](#input-to-the-architecture)).

Against the plan's questions:

1. **Norwegian quality:** mostly edit, not rewrite, at `medium`. About 8 grammar or spelling errors across 20 images remain; at `low` there were about twice as many, including non-words.
2. **Use of metadata, no invention:** dates and existing keywords are used well with prompt v2. Turning GPS coordinates into place names is not reliable (two wrong places in v1), so v2 forbids it, and the app must reverse-geocode itself. A few small inventions remain (see the scoring notes).
3. **Valid JSON:** 90 of 90 calls. This holds by design: the request uses structured outputs (`output_config.format` with a JSON schema), which the app will also use. The schema cannot enforce the keyword count or the alt-text length, so the app must check those.
4. **Latency and cost:** median 5.9 s (3.0–8.9 s) and about $0.0007 per image for the chosen configuration. Latency follows thinking: the 11 of 20 images where the model chose to think took 5.2–8.9 s.

## Runs

All runs on 2026-10-28. Cost uses list prices; thinking tokens are billed as output.

| Run | Model | Effort | Prompt | Images | Median latency (range) | Cost per image | Over 15 keywords | Alt-text over 150 chars |
|---|---|---|---|---|---|---|---|---|
| `135224` | Haiku 5.5 | default (medium) | v1 | 10 only | 9.8 s | $0.0010 | 0 | 0 |
| `135457` | Haiku 5.5 | low | v1 | 10 only | 5.1 s | $0.0006 | 0 | 0 |
| `135802` | Haiku 5.5 | low | v1 | all 20 | 3.8 s (3.1–6.7) | $0.0005 | 12 | 1 |
| `135932` | Haiku 5.5 | low | v1 | 06, 10, 18 × 3 | 5.0 s (3.8–6.1) | $0.0006 | 1 | 3 |
| `140536` | Haiku 5.5 | low | v2 | all 20 | 3.4 s (2.9–5.5) | $0.0005 | 1 | 4 |
| `140653` | Haiku 5.5 | low | v2 | 06, 10, 18 × 3 | 3.8 s (3.1–4.8) | $0.0005 | 0 | 1 |
| `141013` | Haiku 5.5 | medium | v2 | 02, 05, 10, 15, 16 | 3.6 s (2.8–9.0) | $0.0006 | 0 | 1 |
| `141038` | Sonnet 5.5 | low | v2 | 02, 05, 10, 15, 16 | 4.9 s (3.8–7.9) | $0.0095 | 0 | 0 |
| **`141457`** | **Haiku 5.5** | **medium** | **v2** | **all 20** | **5.9 s (3.0–8.9)** | **$0.0007** | **0** | **2** |

Total spend for the pilot: about $0.10.

**Variation:** repeated runs of the same image (06, 10, 18, three times each, with both prompts) gave the same content with different wording and keyword order. Titles were near identical.

**Sonnet 5.5** (five images) wrote about as well as Haiku at `medium` (two to three errors against two), with somewhat more precise descriptions, at about 15 times the cost per image. It was not run on the full set.

**All configurations** misread the small sign "BRYGGEN HUSFLID" in image 10 as "Briggen Husflid" at least once.

## Prompt versions

The full text of each version is in the `prompt.md` of its runs; the current version is in `run_pilot.py`.

v1 → v2, based on the problems in run `135802`:

| Problem in v1 | Change in v2 | Effect |
|---|---|---|
| 12 of 20 images had more than 15 keywords | "Never more than 15: choose the most useful ones" | 0–1 per full run |
| Clock time in descriptions ("kl. 23:01") | Season, month and year only, never the clock time | Gone |
| Wrong places from GPS: Brighton for Worthing (04), Mecklenburg-Vorpommern for Bornholm (20) | Never turn coordinates into a place name; only places visible in the image or given as text | No wrong places; correct places from signs and landmarks (Narvik, Bryggen, the Oslo Opera House) |
| "kvinne" for a person whose gender is not known (07) | Neutral words, do not guess gender | Gone |
| Background facts ("UNESCO", "Hanseatisk kontor") and guessed techniques | Do not add background knowledge or guess materials and techniques | Fewer; "akvarell" for a gouache remains |
| Stock keywords half-translated ("straßenfotografie", "Østgate") | Translate or drop, never keep English or German | Gone; at `low`, also dropped the useful "Prag" |
| Title and description contradicted each other (08) | Fields must agree | Gone |
| Proper nouns in lower case | Capitalisation rule with an example | Better, not fixed ("operahuset, oslo" in 06) |

Side effect of v2: alt-text over 150 characters became more frequent at `low` (4 of 20).

## Scoring: Haiku 5.5, medium, prompt v2 (run `141457`)

Scores 1–3 per the plan's rubric are filled in by the user. The notes are Claude's observations from reading the outputs; places and a few visual claims were checked against the GPS data and the images.

| # | Language | Keywords | Alt-text | Accuracy | Metadata | Notes |
|---|---|---|---|---|---|---|
| 01 | | | | | | "lekende produktstil" (should be "lekent"); "egg-formede" |
| 02 | | | | | | "et hvitt oval fat" (should be "ovalt") |
| 03 | | | | | | Clean |
| 04 | | | | | | "servering-" (should be "serverings-"); no place named, as v2 asks |
| 05 | | | | | | "Lyst stue" (should be "Lys"); "hjemmekontor" not in the image; the dog is really there; alt-text 162 chars |
| 06 | | | | | | Names the Oslo Opera House correctly; keywords "operahuset, oslo" in lower case |
| 07 | | | | | | Neutral "person"; "eftertanke" is riksmål (bokmål "ettertanke") |
| 08 | | | | | | Clean; title and description agree |
| 09 | | | | | | "kjøpe julegaver" invented (photo taken in February); keyword "svart-hvitt" although the bags are red |
| 10 | | | | | | Bryggen and Bergen from the image; "julehus-butikker" clumsy |
| 11 | | | | | | Clean; Trondheim not named, since coordinates are not used |
| 12 | | | | | | Clean; Troms not named, as above |
| 13 | | | | | | 360° aerial panorama, checked against the image; Reine recognised; "turkist vann" (should be "turkis") |
| 14 | | | | | | Reads the signpost (Narvik, 2407 km to the North Pole) |
| 15 | | | | | | Clean; alt-text 153 chars |
| 16 | | | | | | Clean |
| 17 | | | | | | Keeps "Prag" from the IPTC keywords; keeps "meditasjon" from them too |
| 18 | | | | | | "en tykk svart penselstrøk" (should be "et"); "akvarell" guessed, the painting is gouache |
| 19 | | | | | | Clean; country not named |
| 20 | | | | | | Clean; no wrong place (v1 said Mecklenburg-Vorpommern) |

## Input to the architecture

From the pilot and the user's decision on 2026-10-28.

**Provider choice is a setting, not code.** v1 ships the mock provider and the Claude API provider only (D-010, D-017), but the agency must later be able to choose Claude, Google (Gemini), or a local model, from the admin settings page. Adding a provider must mean adding one adapter, not changing the upload flow, the data model or the UI. That means:

- **One provider interface.** Input: image bytes and media type, the extracted metadata as structured fields, and the output language. Output: `title`, `description`, `altText`, `keywords`, plus usage (provider, model, tokens, latency) or a clear error. The mock and Claude providers implement the same interface.
- **The app owns the prompt and the output schema.** They are provider-neutral and versioned (v2 is the starting point). Each adapter only translates them to its API: Claude `output_config.format`, Gemini's response schema, Ollama's `format`.
- **Post-processing in the app, shared by all providers:** cap the keywords at 15, check the alt-text length, normalise case and duplicates. The pilot shows no model follows these rules every time.
- **Place names from the app, not the model.** Reverse-geocode the GPS position in the app and pass the place as text, so every provider gets the same input and none has to guess from coordinates.
- **Settings per provider:** provider ID, model ID, effort or similar parameters, and a reference to an encrypted key (D-017), with environment variables as defaults. The settings page lists the providers that are registered, so a new adapter shows up without UI changes.
- **Traceability per record:** store which provider, model and prompt version produced each set of metadata, so later comparisons (for example with Gemini Flash) can be made on real data.
- **Shared contract tests** that every adapter must pass against recorded responses, so adding a provider does not need new test design.

**Open for the architecture:** whether metadata is generated during upload or in the background after it. With Haiku at `medium` taking up to about 9 s, generating in the background would keep uploads fast; the user accepted the latency either way.

**Later test:** Gemini Flash on the same 20 images with the same prompt and runner. The [provider research](../technical-claude-cli-metadata-provider-2026-10-28/research.md) scored Gemini Flash-Lite as the runner-up. Gemini's free tier must not be used with real images (D-017).
