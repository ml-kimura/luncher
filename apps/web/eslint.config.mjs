import baseConfig from "@packages/eslint-config/base";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "eslint.config.mjs",
    ],
  },
  ...baseConfig,
]);
