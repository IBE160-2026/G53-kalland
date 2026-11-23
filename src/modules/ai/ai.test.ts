import { desc, eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { metadataGenerations } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { createUploadRows } from "@/modules/images";
import { loginAs } from "@/test/login-as";
import { generate } from "./generate";
import { AiError, KEYWORD_CATEGORIES, type AiInput, type AiOutput } from "./port";
import { OUTPUT_SCHEMA, parseOutput, PROMPT_VERSION, SYSTEM_PROMPT } from "./prompt";
import { createMockProvider, PLACEHOLDER_OUTPUT } from "./providers/mock";

const FIXTURE: AiOutput = {
  title: "Fishing boats in the harbour",
  description: "Small fishing boats lie still in a calm harbour on a grey morning.",
  altText: "Fishing boats moored in a calm harbour.",
  keywords: KEYWORD_CATEGORIES.map((category) => ({ term: `fixture ${category}`, category })),
};

// The registry's mock reads these fixtures: one good, one with a category outside FR-12's list.
vi.mock("./providers/mock-fixtures", () => ({
  MOCK_FIXTURES: {
    "fixture.jpg": {
      title: "Fishing boats in the harbour",
      description: "Small fishing boats lie still in a calm harbour on a grey morning.",
      altText: "Fishing boats moored in a calm harbour.",
      keywords: [
        { term: "fixture place", category: "place" },
        { term: "fixture weather_season", category: "weather_season" },
        { term: "fixture emotion", category: "emotion" },
        { term: "fixture colour_adjective", category: "colour_adjective" },
        { term: "fixture activity", category: "activity" },
        { term: "fixture object", category: "object" },
        { term: "fixture perspective_composition", category: "perspective_composition" },
      ],
    },
    "bad-output.jpg": {
      title: "A title",
      description: "A description.",
      altText: "Alt text.",
      keywords: [{ term: "harbour", category: "mood" }],
    },
  },
}));

function input(filename = "harbour.jpg"): AiInput {
  return { image: Buffer.from("jpeg"), mediaType: "image/jpeg", metadataText: "No metadata.", outputLanguage: "en", filename };
}

const saved = { provider: process.env.AI_PROVIDER, fail: process.env.MOCK_FAIL, delay: process.env.MOCK_DELAY_MS };
afterEach(() => {
  for (const [name, value] of [["AI_PROVIDER", saved.provider], ["MOCK_FAIL", saved.fail], ["MOCK_DELAY_MS", saved.delay]] as const) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

async function categoryOf(promise: Promise<unknown>): Promise<string> {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(AiError);
  return (error as AiError).category;
}

describe("prompt v3", () => {
  it("is version v3 and holds the FR-12 people rule and the coordinates rule", () => {
    expect(PROMPT_VERSION).toBe("v3");
    expect(SYSTEM_PROMPT).toContain("Describe what is visible.");
    expect(SYSTEM_PROMPT).toContain(
      "Never state or infer a person's ethnicity, religion, health, sexual orientation, political opinion or union membership.",
    );
    expect(SYSTEM_PROMPT).toContain("Never work out who a person is from their appearance.");
    expect(SYSTEM_PROMPT).toContain("Use a person's name only if it is written in the image or given in the metadata.");
    expect(SYSTEM_PROMPT).toContain("never turn coordinates into a place name");
  });

  it("asks for keywords in FR-12's seven categories", () => {
    expect(OUTPUT_SCHEMA.properties.keywords.items.properties.category.enum).toEqual([...KEYWORD_CATEGORIES]);
    for (const category of KEYWORD_CATEGORIES) expect(SYSTEM_PROMPT).toContain(category);
  });
});

describe("parseOutput", () => {
  it("accepts output that matches the schema", () => {
    expect(parseOutput(JSON.stringify(FIXTURE))).toEqual(FIXTURE);
  });

  it.each([
    ["a category not in the list", JSON.stringify({ ...FIXTURE, keywords: [{ term: "harbour", category: "mood" }] })],
    ["a missing field", JSON.stringify({ title: "Boats", description: "Boats.", keywords: [] })],
    ["an empty title", JSON.stringify({ ...FIXTURE, title: " " })],
    ["a title of only control characters", JSON.stringify({ ...FIXTURE, title: "\u0007\u001b" })],
    ["text that is not JSON", "Here are the boats"],
  ])("refuses %s as invalid_output, keeping the raw answer", (_name, raw) => {
    const error = (() => {
      try {
        parseOutput(raw);
      } catch (e) {
        return e;
      }
    })();
    expect(error).toBeInstanceOf(AiError);
    expect(error).toMatchObject({ category: "invalid_output", rawOutput: raw });
  });
});

describe("the mock provider", () => {
  const options = { fixtures: { "fixture.jpg": FIXTURE }, delayMs: () => 0, fail: () => false };

  it("returns the fixture for a known file name", async () => {
    const reply = await createMockProvider(options).generate(input("fixture.jpg"));
    expect(parseOutput(reply.rawOutput)).toEqual(FIXTURE);
  });

  it("returns labelled placeholder metadata otherwise, one keyword per category, with zero usage", async () => {
    const mock = createMockProvider(options);
    expect(mock).toMatchObject({ name: "mock", model: "mock" });
    const reply = await mock.generate(input("other.jpg"));
    const output = parseOutput(reply.rawOutput);
    expect(output).toEqual(PLACEHOLDER_OUTPUT);
    expect(output.title).toBe("Placeholder title from the mock AI");
    expect(output.keywords.map((k) => k.category)).toEqual([...KEYWORD_CATEGORIES]);
    expect(reply.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("waits delayMs before answering", async () => {
    const started = performance.now();
    await createMockProvider({ ...options, delayMs: () => 120 }).generate(input());
    expect(performance.now() - started).toBeGreaterThanOrEqual(110);
  });

  it("fails as unavailable when told to, or for a file name containing fail", async () => {
    expect(await categoryOf(createMockProvider({ ...options, fail: () => true }).generate(input()))).toBe("unavailable");
    expect(await categoryOf(createMockProvider(options).generate(input("fail-boat.png")))).toBe("unavailable");
    expect(await categoryOf(createMockProvider(options).generate(input("Boat-FAIL.jpg")))).toBe("unavailable");
  });

  it("records the inputs it received, keeping the latest ten", async () => {
    const mock = createMockProvider(options);
    for (let i = 0; i < 12; i++) await mock.generate(input(`image-${i}.jpg`));
    expect(mock.received.map((r) => r.filename)).toEqual(Array.from({ length: 10 }, (_, i) => `image-${i + 2}.jpg`));
  });
});

describe("generate", () => {
  let imageId: string;
  beforeAll(async () => {
    const { actor } = await loginAs(fixtureUsers.ida);
    const { images } = await createUploadRows(getDb(), actor, { filenames: ["ai-test.jpg"] });
    imageId = images[0].id;
  });

  async function latestRun() {
    const [row] = await getDb()
      .select()
      .from(metadataGenerations)
      .where(eq(metadataGenerations.imageId, imageId))
      .orderBy(desc(metadataGenerations.createdAt), desc(metadataGenerations.id))
      .limit(1);
    return row;
  }

  it("uses the mock by default and records a successful run", async () => {
    delete process.env.AI_PROVIDER;
    process.env.MOCK_FAIL = "false";
    const result = await generate(imageId, input());
    expect(result).toEqual({ ok: true, output: { ...PLACEHOLDER_OUTPUT, usage: { inputTokens: 0, outputTokens: 0 } } });
    expect(await latestRun()).toMatchObject({
      provider: "mock",
      model: "mock",
      promptVersion: "v3",
      outcome: "success",
      errorCategory: null,
      inputTokens: 0,
      outputTokens: 0,
      rawOutput: JSON.stringify(PLACEHOLDER_OUTPUT),
    });
    expect((await latestRun()).latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns a seed image's fixture through the registry", async () => {
    const result = await generate(imageId, input("fixture.jpg"));
    expect(result).toMatchObject({ ok: true, output: { title: FIXTURE.title } });
  });

  it("records MOCK_FAIL as an error run", async () => {
    process.env.MOCK_FAIL = "true";
    expect(await generate(imageId, input())).toEqual({ ok: false, category: "unavailable" });
    expect(await latestRun()).toMatchObject({
      provider: "mock",
      outcome: "error",
      errorCategory: "unavailable",
      inputTokens: null,
      rawOutput: null,
    });
  });

  it("records output outside the schema as invalid_output, with the raw output", async () => {
    expect(await generate(imageId, input("bad-output.jpg"))).toEqual({ ok: false, category: "invalid_output" });
    const run = await latestRun();
    expect(run).toMatchObject({ outcome: "error", errorCategory: "invalid_output", inputTokens: 0 });
    expect(run.rawOutput).toContain('"category":"mood"');
  });

  it("treats an unknown provider as unavailable and records it", async () => {
    process.env.AI_PROVIDER = "nonesuch";
    expect(await generate(imageId, input())).toEqual({ ok: false, category: "unavailable" });
    expect(await latestRun()).toMatchObject({ provider: "nonesuch", model: "unknown", outcome: "error", errorCategory: "unavailable" });
  });
});
