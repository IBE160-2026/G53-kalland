import type { AiProvider } from "../port";
import { createMockProvider } from "./mock";
import { MOCK_FIXTURES } from "./mock-fixtures";

function mockDelayMs(): number {
  const value = Number(process.env.MOCK_DELAY_MS ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export const mockProvider = createMockProvider({
  fixtures: MOCK_FIXTURES,
  delayMs: mockDelayMs,
  fail: () => process.env.MOCK_FAIL === "true",
});

// The one list of providers (AD-21), by the name AI_PROVIDER uses. The Claude adapter joins in Story 3.5.
export const PROVIDERS: Readonly<Record<string, AiProvider>> = { mock: mockProvider };

export const DEFAULT_PROVIDER = "mock";
