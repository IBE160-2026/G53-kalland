// The provider port (AD-21). Generation is pure: an adapter gets the AI image and text and answers
// with the model's output as text, or throws an AiError. It never reads files or the database.

// FR-12's seven keyword categories, in the order the prompt lists them.
export const KEYWORD_CATEGORIES = [
  "place",
  "weather_season",
  "emotion",
  "colour_adjective",
  "activity",
  "object",
  "perspective_composition",
] as const;
export type KeywordCategory = (typeof KEYWORD_CATEGORIES)[number];

export const AI_ERROR_CATEGORIES = ["auth", "rate_limit", "timeout", "unavailable", "refused", "invalid_output"] as const;
export type AiErrorCategory = (typeof AI_ERROR_CATEGORIES)[number];

export type AiInput = {
  // The AI input made by media: oriented, at most 1568 px, sRGB, no metadata (AD-16).
  image: Buffer;
  mediaType: "image/jpeg";
  // The stored embedded metadata as text, with the coordinates rule (FR-12).
  metadataText: string;
  outputLanguage: "en";
  // Only the mock reads it (fixtures and the fail switch, AD-22); real adapters ignore it, since a
  // file name is not metadata a model should get.
  filename: string;
};

export type AiOutput = {
  title: string;
  description: string;
  altText: string;
  keywords: { term: string; category: KeywordCategory }[];
};

export type AiUsage = { inputTokens: number; outputTokens: number };

// The port's output once the app's schema has parsed the provider's answer.
export type AiResult = AiOutput & { usage: AiUsage };

// What an adapter answers: the model's output as text (parsed by the app, never by the adapter).
export type ProviderReply = { rawOutput: string; usage: AiUsage };

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  generate(input: AiInput): Promise<ProviderReply>;
}

export class AiError extends Error {
  constructor(
    readonly category: AiErrorCategory,
    message: string = category,
    readonly rawOutput: string | null = null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AiError";
  }
}
