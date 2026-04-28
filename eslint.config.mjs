import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '.turbo/**',
      '.git/**',
      'apps/**',
      'packages/**',
      'docs/**',
      '.cursor/**',
      '.aidlc/**',
      'aidlc-docs/**',
      '**/dist/**',
      '**/.next/**',
      '**/storybook-static/**',
      '**/.vitepress/**',
      '**/coverage/**',
    ],
  },
]);
