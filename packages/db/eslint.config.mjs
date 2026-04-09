import baseConfig from "@packages/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "src/relations.ts"],
  },
  ...baseConfig,
);
