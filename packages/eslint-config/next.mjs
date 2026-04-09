import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from "./base.mjs";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const nextConfig = tseslint.config(
  ...baseConfig,
  ...compat.extends("next/core-web-vitals"),
);

export default nextConfig;
