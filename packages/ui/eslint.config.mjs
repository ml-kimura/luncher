import baseConfig from "@packages/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "storybook-static/**"],
  },
  ...baseConfig,
);
