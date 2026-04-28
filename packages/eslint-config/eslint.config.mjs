import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/**", "dist/**", "eslint.config.mjs"],
  },
  {
    files: ["*.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [resolve(__dirname, "tsconfig.json")],
      },
    },
  },
]);
