import { getDb } from "@/db/client";
import { metadataGenerations } from "@/db/schema";
import { DEFAULT_TENANT_ID } from "@/db/tenant";
import { log } from "@/modules/shared/log";
import { AiError, type AiErrorCategory, type AiInput, type AiProvider, type AiResult, type ProviderReply } from "./port";
import { parseOutput, PROMPT_VERSION } from "./prompt";
import { DEFAULT_PROVIDER, PROVIDERS } from "./providers";

export type GenerateResult = { ok: true; output: AiResult } | { ok: false; category: AiErrorCategory };

type Run = {
  provider: string;
  model: string;
  latencyMs: number;
  reply?: ProviderReply;
  result?: AiResult;
  error?: AiError;
};

function resolveProvider(): { name: string; provider?: AiProvider } {
  const name = process.env.AI_PROVIDER || DEFAULT_PROVIDER;
  return { name, provider: Object.hasOwn(PROVIDERS, name) ? PROVIDERS[name] : undefined };
}

async function record(imageId: string, run: Run): Promise<void> {
  await getDb()
    .insert(metadataGenerations)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      imageId,
      provider: run.provider,
      model: run.model,
      promptVersion: PROMPT_VERSION,
      outcome: run.result ? "success" : "error",
      errorCategory: run.error?.category ?? null,
      inputTokens: run.reply?.usage.inputTokens ?? null,
      outputTokens: run.reply?.usage.outputTokens ?? null,
      latencyMs: run.latencyMs,
      rawOutput: run.reply?.rawOutput ?? run.error?.rawOutput ?? null,
    });
}

// Runs the provider chosen by AI_PROVIDER (default mock) on one image's input, parses its answer with
// the app's schema and records the run in metadata_generations, success or error (AD-21). An unknown
// provider is `unavailable`; an unexpected error from an adapter is logged and `unavailable` too.
export async function generate(imageId: string, input: AiInput): Promise<GenerateResult> {
  const { name, provider } = resolveProvider();
  const started = performance.now();
  const run: Run = { provider: name, model: provider?.model ?? "unknown", latencyMs: 0 };
  let outcome: GenerateResult;
  try {
    if (!provider) throw new AiError("unavailable", `Unknown AI provider "${name}".`);
    run.reply = await provider.generate(input);
    run.result = { ...parseOutput(run.reply.rawOutput), usage: run.reply.usage };
    outcome = { ok: true, output: run.result };
  } catch (error) {
    run.error = error instanceof AiError ? error : new AiError("unavailable", "The provider failed unexpectedly.", null, { cause: error });
    log.error({ err: run.error, imageId, provider: name, category: run.error.category }, "AI generation failed.");
    outcome = { ok: false, category: run.error.category };
  }
  run.latencyMs = Math.round(performance.now() - started);
  await record(imageId, run);
  return outcome;
}
