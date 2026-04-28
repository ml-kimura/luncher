import baseConfig from '@packages/eslint-config/base';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'docs/.vitepress/cache/**', 'docs/.vitepress/dist/**', 'eslint.config.mjs'],
  },
  ...baseConfig,
]);
