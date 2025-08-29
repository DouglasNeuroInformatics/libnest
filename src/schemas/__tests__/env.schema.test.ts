import { describe, expect, it } from 'vitest';

import { $BaseEnv } from '../env.schema.js';

describe('$BaseEnv', () => {
  it('should parse and validate a correct configuration', () => {
    const input = {
      API_PORT: '5500',
      DEBUG: 'true',
      NODE_ENV: 'development',
      SECRET_KEY: 'a2c2ee0ef53a858201ee8a5fc4b5955ccd4bb7c8fee8d00a',
      VERBOSE: 'true'
    };
    const result = $BaseEnv.parse(input);
    expect(result).toEqual({
      ...input,
      API_PORT: 5500,
      DEBUG: true,
      THROTTLER_ENABLED: true,
      VERBOSE: true
    });
  });

  it('should fail if SECRET_KEY is too short', () => {
    const input = {
      NODE_ENV: 'development',
      SECRET_KEY: '25258d38'
    };
    expect(() => $BaseEnv.parse(input)).toThrow();
  });
});
