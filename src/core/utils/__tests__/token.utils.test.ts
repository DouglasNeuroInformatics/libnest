import { describe, expect, it } from 'vitest';

import { defineToken } from '../token.utils.js';

describe('defineToken', () => {
  it('should return an object with a single key where the key is equal to the value', () => {
    expect(defineToken('LIBNEST_TOKEN')).toStrictEqual({ LIBNEST_TOKEN: 'LIBNEST_TOKEN' });
  });
});
