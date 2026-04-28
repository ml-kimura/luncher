import { describe, expect, it } from 'vitest';

describe('web smoke', () => {
  it('runs test environment', () => {
    expect('web smoke test').toContain('smoke');
  });
});
