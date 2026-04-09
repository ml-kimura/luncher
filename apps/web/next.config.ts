import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo root so Turbopack resolves `next` from this app’s node_modules. */
const monorepoRoot = path.join(appDir, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@packages/ui"],
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
