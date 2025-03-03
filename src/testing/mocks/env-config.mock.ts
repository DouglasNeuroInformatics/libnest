import type { BaseEnv } from '../../config/schema.js';

export const mockEnvConfig: BaseEnv = Object.freeze({
  API_DEV_SERVER_PORT: 5500,
  API_PROD_SERVER_PORT: 80,
  DEBUG: false,
  MONGO_URI: new URL('mongodb://localhost:27017'),
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  THROTTLER_ENABLED: true,
  VERBOSE: false
});
