import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Native modules run in Node, not in the bundle (AD-24). Next already externalises pg, pino and @node-rs/argon2.
  serverExternalPackages: ["exiftool-vendored", "sharp"],
  // CLAUDE.md is this repo's agent guide; stop `next dev` from writing AGENTS.md into the root.
  agentRules: false,
  // forbidden() and forbidden.tsx for a contact on a staff route, and vice versa (AD-5).
  experimental: { authInterrupts: true },
};

export default createNextIntlPlugin()(nextConfig);
