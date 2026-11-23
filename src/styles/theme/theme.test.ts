import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// ROLES is a copy of DESIGN.md's Colors table (UX-DR-1, UX-DR-4), checked against the --ds-* variables in the
// generated light scheme. If the theme is regenerated without the overrides in designsystemet.config.json,
// this fails. Keep ROLES in step with the table when DESIGN.md changes.
const ROLES: Record<string, string> = {
  "accent-base-default": "#25282D", // accent
  "accent-base-hover": "#1D1F24", // accent-hover
  "accent-base-active": "#14171C", // accent-active
  "accent-base-contrast-default": "#FFFFFF", // on-accent
  "accent-text-subtle": "#25282D", // accent-text
  "accent-surface-tinted": "#E3E4E6", // selected-tint
  "accent-background-tinted": "#F3F3F4", // selected-row-tint
  "neutral-background-tinted": "#F5F6F6", // canvas
  "neutral-surface-default": "#FFFFFF", // surface
  "neutral-surface-tinted": "#EDEEEF", // surface-tinted
  "neutral-surface-hover": "#E2E3E4", // surface-hover
  "neutral-text-default": "#202124", // text
  "neutral-text-subtle": "#595C5F", // text-muted
  "neutral-border-default": "#7F8185", // border
  "neutral-border-strong": "#5F6265", // border-strong
  "neutral-border-subtle": "#CCCED0", // hairline
  "brand1-base-default": "#5D6672", // price
  "success-base-default": "#16803C", // success
  "success-text-subtle": "#186B34", // success-text
  "danger-base-default": "#CC1631", // danger
  "danger-text-subtle": "#BD0529", // danger-text
  "warning-base-default": "#EE6A0E", // warning
  "warning-text-subtle": "#A84802", // warning-text
  "warning-base-contrast-default": "#000000", // on-warning
  "info-base-default": "#1E5FC2", // info
  "info-text-subtle": "#255BB1", // info-text
  "focus-outer": "#25282D", // focus-outer
  "focus-inner": "#FFFFFF", // focus-inner
};

const css = readFileSync(new URL("./graphite.css", import.meta.url), "utf8");

// The declarations of the first rule inside a given @layer block.
function declarations(layer: string): Map<string, string> {
  const start = css.indexOf(`@layer ${layer} {`);
  if (start === -1) throw new Error(`@layer ${layer} not found in graphite.css`);
  const body = css.slice(css.indexOf("{", css.indexOf("{", start) + 1) + 1);
  const block = body.slice(0, body.indexOf("}"));
  const map = new Map<string, string>();
  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(match[1], match[2].trim());
  return map;
}

describe("the generated Graphite theme", () => {
  const light = declarations("ds.theme.color-scheme.light");

  it.each(Object.entries(ROLES))("sets --ds-color-%s to %s in the light scheme", (variable, hex) => {
    expect(light.get(`--ds-color-${variable}`)?.toUpperCase()).toBe(hex);
  });

  it("has the crisp 3 px base radius", () => {
    expect(declarations("ds.theme.semantic").get("--ds-border-radius-base")).toBe("0.1875rem");
  });

  it("uses Instrument Sans", () => {
    expect(declarations("ds.theme.typography.primary").get("--ds-font-family")).toBe("Instrument Sans");
  });
});
