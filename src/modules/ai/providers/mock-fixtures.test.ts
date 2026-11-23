import { readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { SEED_IMAGES_DIR } from "@/db/seed/fixture";
import { KEYWORD_CATEGORIES, type AiInput } from "../port";
import { parseOutput } from "../prompt";
import { createMockProvider } from "./mock";
import { MOCK_FIXTURES } from "./mock-fixtures";

const entries = Object.entries(MOCK_FIXTURES);

function input(filename: string): AiInput {
  return { image: Buffer.from("jpeg"), mediaType: "image/jpeg", metadataText: "No metadata.", outputLanguage: "en", filename };
}

describe("the mock's fixture metadata (AD-22)", () => {
  it("has exactly one entry per seed image", async () => {
    const files = (await readdir(SEED_IMAGES_DIR)).filter((file) => /\.(jpe?g|png)$/i.test(file));
    expect(Object.keys(MOCK_FIXTURES).sort()).toEqual(files.sort());
  });

  it.each(entries)("%s passes the app's output schema, with 5–10 keywords and alt text of at most 125 characters", (_, output) => {
    expect(parseOutput(JSON.stringify(output))).toEqual(output);
    expect(output.keywords.length).toBeGreaterThanOrEqual(5);
    expect(output.keywords.length).toBeLessThanOrEqual(10);
    expect(output.altText.length).toBeLessThanOrEqual(125);
    const terms = output.keywords.map((k) => k.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("covers every one of the seven keyword categories across the set", () => {
    const used = new Set(entries.flatMap(([, output]) => output.keywords.map((k) => k.category)));
    expect([...used].sort()).toEqual([...KEYWORD_CATEGORIES].sort());
  });

  it("is what the mock returns for a seed file, except the fail file, which still fails", async () => {
    const mock = createMockProvider({ fixtures: MOCK_FIXTURES, delayMs: () => 0, fail: () => false });
    const reply = await mock.generate(input("jellyfish-tank.jpg"));
    expect(parseOutput(reply.rawOutput)).toEqual(MOCK_FIXTURES["jellyfish-tank.jpg"]);
    await expect(mock.generate(input("aquarium-jellyfish-fail.jpg"))).rejects.toMatchObject({ category: "unavailable" });
  });
});
