# D3 Privacy and retention — round 1 digest (accessed 2026-10-28)

- claim: Anthropic API (commercial): inputs and outputs deleted on the backend within 30 days. | src: privacy.claude.com/en/articles/7996866 (dated 2026-07-01) | Anthropic | conf: medium — secondary sources disagree (some report 7 days since Sept 2025); contract governs. status: disputed
- claim: "Anthropic does not use uploaded images to train models"; API images are not stored beyond the request. | src: platform.claude.com/docs/en/build-with-claude/vision (FAQ) | Anthropic | conf: high
- claim: Commercial API data is not used for training by default. | src: support.anthropic.com/en/articles/7996875; companyscope.io | Anthropic + secondary | conf: high
- claim: Consumer plans (Free/Pro/Max, incl. Claude Code on those accounts) are under separate consumer privacy terms with a user training setting. | src: privacy.claude.com article (links out) | conf: medium
- claim: Gemini API free tier: "Content used to improve our products" = Yes; paid tier = No. | src: ai.google.dev/gemini-api/docs/pricing (updated 2026-10-27) | Google | conf: high
- claim: Ollama runs locally; images never leave the machine (by design of local inference). | conf: high (architectural)
