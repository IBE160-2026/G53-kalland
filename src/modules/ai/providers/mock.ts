import { setTimeout as sleep } from "node:timers/promises";
import { AiError, KEYWORD_CATEGORIES, type AiInput, type AiOutput, type AiProvider } from "../port";

// Clearly labelled, so nobody mistakes it for a real description (AD-22).
export const PLACEHOLDER_OUTPUT: AiOutput = {
  title: "Placeholder title from the mock AI",
  description: "Placeholder description from the mock AI provider. Set AI_PROVIDER to use a real model.",
  altText: "Placeholder alt text from the mock AI provider.",
  keywords: KEYWORD_CATEGORIES.map((category) => ({ term: `mock ${category}`, category })),
};

// How many inputs the mock keeps for tests to inspect (SC-13); older ones are dropped.
const RECEIVED_LIMIT = 10;

export type MockProvider = AiProvider & { readonly received: AiInput[] };

// The mock provider (AD-22): fixture metadata for a known file name, placeholder metadata otherwise,
// after `delayMs`. It fails as `unavailable` when `fail()` is true or the file name contains "fail".
// The options are read on every call, so a changed environment takes effect at once.
export function createMockProvider(options: {
  fixtures: Record<string, AiOutput>;
  delayMs: () => number;
  fail: () => boolean;
}): MockProvider {
  const received: AiInput[] = [];
  return {
    name: "mock",
    model: "mock",
    received,
    async generate(input) {
      received.push(input);
      if (received.length > RECEIVED_LIMIT) received.shift();
      const delay = options.delayMs();
      if (delay > 0) await sleep(delay);
      if (options.fail() || input.filename.toLowerCase().includes("fail")) {
        throw new AiError("unavailable", "The mock provider was told to fail.");
      }
      const output = Object.hasOwn(options.fixtures, input.filename) ? options.fixtures[input.filename] : PLACEHOLDER_OUTPUT;
      return { rawOutput: JSON.stringify(output), usage: { inputTokens: 0, outputTokens: 0 } };
    },
  };
}
