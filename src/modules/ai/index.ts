// Public API of the ai module (AD-3). Owns (writes) the tables: metadata_generations, ai_settings.
import type { AiInput } from "./port";
import { mockProvider } from "./providers";

export { generate, type GenerateResult } from "./generate";
export {
  AI_ERROR_CATEGORIES,
  KEYWORD_CATEGORIES,
  type AiErrorCategory,
  type AiInput,
  type AiOutput,
  type AiResult,
  type KeywordCategory,
} from "./port";
export { PROMPT_VERSION } from "./prompt";

// Test hook (SC-13): the latest inputs the default mock provider received, most recent last.
export function mockReceivedInputs(): readonly AiInput[] {
  return mockProvider.received;
}
