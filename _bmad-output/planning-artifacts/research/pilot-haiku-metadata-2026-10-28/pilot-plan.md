---
title: "Pilot plan: Claude Haiku 5.5 for Norwegian image metadata"
status: complete
created: 2026-10-28
---

# Pilot plan: Claude Haiku 5.5 for Norwegian image metadata

The [metadata provider research](../technical-claude-cli-metadata-provider-2026-10-28/research.md) picked the Claude API with a Haiku-class vision model (D-017), but no source measures Norwegian keyword or alt-text quality. This pilot answers that, and measures latency, before the architecture fixes the provider.

## Questions

1. Are the title, description, alt-text and keywords good enough in Norwegian (bokmål) that staff mostly edit rather than rewrite?
2. Does the model use the embedded metadata (place, date, existing IPTC keywords) when it gets them as text, and does it avoid inventing facts it cannot see?
3. Is the JSON response valid every time?
4. What is the latency per image, and the cost per image?

## Image set (about 20)

CC0 and public-domain images from Wikimedia Commons, resized to 1568 px on the long edge before sending. The chosen images, with author, licence and link, are listed in [sources.md](sources.md); the files stay local and are not committed. The set covers:

| Group | Count | Why |
|---|---|---|
| Typical agency motifs: products, interiors, food, architecture | 6 | The everyday case |
| People, one person and groups | 3 | Alt-text must describe without guessing identity, age or ethnicity |
| Norwegian places, landscape and city, with GPS in EXIF | 4 | Does it use the place name from the metadata, and spell Norwegian names right? |
| Text in the image: signs, packaging | 2 | Reads and uses visible text |
| Existing IPTC keywords or caption | 2 | Keeps or builds on them instead of ignoring them |
| Hard cases: abstract, dark, blurry, near-empty | 3 | Admits uncertainty instead of making things up |

## Setup

- Model: Claude Haiku 5.5 through the Messages API. The model ID comes from configuration, not hard-coded.
- One fixed prompt, in English instructions, asking for Norwegian output and a JSON object with `title`, `description`, `altText` and `keywords` (5–15). The extracted EXIF/IPTC fields go in as text (the API does not read embedded metadata).
- Run each image once, and three images three times, to see how much the output varies.
- Optional comparison: Gemini Flash-Lite on the same set and prompt (the runner-up in the research).
- The API key comes from an environment variable and is never logged. Prompts and raw responses are saved next to this plan as evidence.

## Scoring (per image, 1–3)

| Criterion | 3 | 2 | 1 |
|---|---|---|---|
| Norwegian language | Natural bokmål, correct spelling and inflection | Small errors or anglicisms | Unnatural or wrong language |
| Keywords | Words staff would search with, no noise | Usable, some noise or gaps | Mostly unusable |
| Alt-text | Concise (under about 150 characters), describes what matters | Too long or too generic | Wrong or misleading |
| Accuracy | Nothing invented | Small inaccuracy | Invents people, places or facts |
| Use of metadata | Uses place/date/keywords correctly | Partly | Ignores or contradicts them |

Also record per image: valid JSON (yes/no), latency in seconds, input and output tokens.

## Decision rule

- **Go:** average 2.5 or above on language and keywords, no image scores 1 on accuracy, every response is valid JSON, and the median latency is acceptable for an upload (target under about 5 s). Haiku 5.5 goes into the architecture.
- **Partly:** good content but weak Norwegian. Try a larger Claude model or adjust the prompt, then decide.
- **No-go:** go to the runner-up (Gemini Flash-Lite) and record a new decision.

## Prerequisites

- An API key: the agency's Console organisation linked to the Team plan, or a personal Console account (open question to the agency).
- A short throwaway script to run the set. It stays outside the app code and is not committed as product code.

## Output

A `results.md` next to this plan: the score table, latency and cost summary, notable good and bad examples, and the go/no-go verdict as input to `bmad-architecture`.
