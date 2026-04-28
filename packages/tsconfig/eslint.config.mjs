import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules/**'],
  },
  js.configs.recommended,
]);
