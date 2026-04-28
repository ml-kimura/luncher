import baseConfig from '@packages/eslint-config/base';
import { defineConfig } from 'eslint/config';

const scopedBaseConfig = baseConfig.map((config) => {
  if ('ignores' in config) {
    return config;
  }
  return {
    ...config,
    files: ['scripts/**/*.ts'],
  };
});

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/eslint.config.mjs'],
  },
  ...scopedBaseConfig,
]);
