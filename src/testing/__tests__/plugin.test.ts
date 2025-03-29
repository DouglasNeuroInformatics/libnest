import { describe, expect, it } from 'vitest';

import plugin from '../plugin.js';

describe('plugin', () => {
  it('should return an array', () => {
    expect(Array.isArray(plugin())).toBe(true);
  });
});
