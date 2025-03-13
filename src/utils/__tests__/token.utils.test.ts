import { describe, expect, it } from 'vitest';

import { defineToken } from '../token.utils.js';

describe('defineToken', () => {
  it('should return an object with a single key where the key is equal to the value, with a prefix attached', () => {
    expect(defineToken('TOKEN')).toStrictEqual({ TOKEN: 'LIBNEST_TOKEN' });
  });
});
