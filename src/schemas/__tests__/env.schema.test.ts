import { describe, expect, it } from 'vitest';

import { $BaseEnv } from '../env.schema.js';

describe('$BaseEnv', () => {
  it('should parse and validate a correct configuration', () => {
    const input = {
      API_PORT: '5500',
      DEBUG: 'true',
      MONGO_URI: 'mongodb://localhost:27017',
      NODE_ENV: 'development',
      SECRET_KEY: 'a2c2ee0ef53a858201ee8a5fc4b5955ccd4bb7c8fee8d00a',
      VERBOSE: 'true'
    };
    const result = $BaseEnv.parse(input);
    expect(result).toEqual({
      ...input,
      API_PORT: 5500,
      DEBUG: true,
      MONGO_URI: expect.objectContaining({
        href: 'mongodb://localhost:27017'
      }),
      THROTTLER_ENABLED: true,
      VERBOSE: true
    });
  });

  it('should fail if MONGO_URI is not a valid URL', () => {
    const input = {
      MONGO_URI: 'invalid-uri',
      NODE_ENV: 'development',
      SECRET_KEY: 'a2c2ee0ef53a858201ee8a5fc4b5955ccd4bb7c8fee8d00a'
    };
    expect(() => $BaseEnv.parse(input)).toThrow();
  });

  it('should fail if SECRET_KEY is too short', () => {
    const input = {
      MONGO_URI: 'mongodb://localhost:27017',
      NODE_ENV: 'development',
      SECRET_KEY: '25258d38'
    };
    expect(() => $BaseEnv.parse(input)).toThrow();
  });
});
