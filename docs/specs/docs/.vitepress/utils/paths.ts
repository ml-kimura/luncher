import path from 'path';

/**
 * VitePress のコンテンツルート（`docs/`）。`docs/.vitepress/utils` から見て2つ上。
 * 各 `*.paths.ts` で `import.meta.dirname` を何段も上げる代わりに使う。
 */
export const docsDir = path.resolve(import.meta.dirname, '../..');

/**
 * Public directory
 */
export const publicDir = path.resolve(docsDir, 'public');
