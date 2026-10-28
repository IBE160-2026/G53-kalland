# D4 Alternatives — round 1 digest (accessed 2026-10-28)

- claim: Claude API vision accepts base64, URL or Files API file_id; JPEG/PNG/GIF/WebP; ≤10 MB per image (base64); image cost = ceil(w/28)*ceil(h/28) visual tokens; 1000×1000 px ≈ 1,296 tokens. Claude does not read embedded metadata. Claude refuses to identify people. | src: platform.claude.com/docs/en/build-with-claude/vision | Anthropic | conf: high
- claim: Claude Haiku 5.5: $0.10/MTok input, $0.50/MTok output (prompts ≤100k tokens); Sonnet 5.5 $2/$10; Batch API −50 %. | src: platform.claude.com/docs/en/about-claude/pricing | Anthropic | accessed 2026-10-28 | conf: medium (one primary source; pricing is a two-source class)
- derived: one ~1000 px image + ~300 prompt tokens + ~300 output tokens on Haiku 5.5 ≈ 1,600×$0.10/M + 300×$0.50/M ≈ $0.0003 → ~$0.15 per 500 images.
- claim: Gemini 3.1 Flash-Lite paid $0.25/MTok input (text/image), $1.50 output; Gemini 3.6/3.8 Flash $0.75/$3.75 through 2026-12-31, doubling 2027-01-01; free tier exists but content is used to improve Google products. | src: ai.google.dev/gemini-api/docs/pricing (updated 2026-10-27) | Google | conf: medium (single source)
- claim: Ollama structured outputs: JSON schema in `format` constrains decoding and works with vision models (docs example llama3.2-vision); no source confirms Gemma specifically. | src: docs.ollama.com/capabilities/structured-outputs | Ollama | conf: high for mechanism, low for Gemma
- gap: no source found on Norwegian-language keyword/alt-text quality for any candidate. Needs a hands-on pilot.
