import baseConfig from '@packages/eslint-config/base';
import { defineConfig } from 'eslint/config';

const scopedBaseConfig = baseConfig.map((config) => {
  if ('ignores' in config) {
    return config;
  }
  return {
    ...config,
    files: ['scripts/**/*.{ts,tsx}'],
  };
});

export default defineConfig([
  ...scopedBaseConfig,
  {
    files: ['scripts/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
