/**
 * Local commitlint configuration.
 *
 * In addition to Conventional Commits defaults we enforce:
 *   - scope-case: kebab-case (rejects e.g. `feat(API): ...`).
 *   - scope-no-multiple: rejects multi-token scopes such as `feat(api,docs): ...`,
 *     `feat(api/docs): ...`, or `feat(api docs): ...`. commitlint by itself
 *     splits these on `,`/`/`/whitespace and accepts each fragment, so the
 *     CI commit-check-action rejects them while the local hook would not.
 *     This custom rule keeps the local hook aligned with CI.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'scope-no-multiple': (parsed) => {
          const header = parsed.header ?? '';
          const match = header.match(/^[^(]+\(([^)]+)\)/);
          if (!match) {
            return [true];
          }
          const scope = match[1];
          if (/[,\/\s]/.test(scope)) {
            return [false, `scope must be a single token without separators (",", "/", whitespace); got "${scope}"`];
          }
          return [true];
        },
      },
    },
  ],
  rules: {
    'scope-case': [2, 'always', 'kebab-case'],
    'scope-no-multiple': [2, 'always'],
  },
};
