import { describe, expect, it } from 'vitest';

import { $BaseRuntimeConfig } from '../config.schema.js';

describe('$BaseRuntimeConfig', () => {
  it('should parse and validate a correct configuration', () => {
    const input = {
      API_DEV_SERVER_PORT: '3000',
      DEBUG: 'true',
      MONGO_URI: 'mongodb://localhost:27017',
      NODE_ENV: 'development',
      SECRET_KEY: 'a2c2ee0ef53a858201ee8a5fc4b5955ccd4bb7c8fee8d00a',
      VERBOSE: 'true'
    };
    const result = $BaseRuntimeConfig.parse(input);
    expect(result).toEqual({
      ...input,
      API_DEV_SERVER_PORT: 3000,
      API_PROD_SERVER_PORT: 80,
      DEBUG: true,
      VERBOSE: true
    });
  });

  it('should fail if MONGO_URI is not a valid URL', () => {
    const input = {
      MONGO_URI: 'invalid-uri',
      NODE_ENV: 'development',
      SECRET_KEY: 'a2c2ee0ef53a858201ee8a5fc4b5955ccd4bb7c8fee8d00a'
    };
    expect(() => $BaseRuntimeConfig.parse(input)).toThrow();
  });

  it('should fail if SECRET_KEY is too short', () => {
    const input = {
      MONGO_URI: 'mongodb://localhost:27017',
      NODE_ENV: 'development',
      SECRET_KEY: '25258d38'
    };
    expect(() => $BaseRuntimeConfig.parse(input)).toThrow();
  });
});
