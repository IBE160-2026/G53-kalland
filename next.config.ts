import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Native modules run in Node, not in the bundle (AD-24).
  serverExternalPackages: ["exiftool-vendored", "sharp"],
  // CLAUDE.md is this repo's agent guide; stop `next dev` from writing AGENTS.md into the root.
  agentRules: false,
};

export default createNextIntlPlugin()(nextConfig);
