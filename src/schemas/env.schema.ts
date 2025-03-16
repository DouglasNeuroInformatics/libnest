import { $BooleanLike, $NumberLike, $UrlLike } from '@douglasneuroinformatics/libjs';
import { z } from 'zod';

import type { UserConfig } from '../user-config.js';

/**
 * Schema definition for the base environment options.
 *
 * This schema validates and transforms environment variables used in the application. Users
 * can extend this schema to include additional configuration parameters.
 *
 * @see {@link BaseEnv}
 */
export const $BaseEnv = z.object({
  API_PORT: $NumberLike.pipe(z.number().int().nonnegative()),
  API_RESPONSE_DELAY: $NumberLike.pipe(z.number().positive().int()).optional(),
  DANGEROUSLY_DISABLE_PBKDF2_ITERATION: $BooleanLike.optional(),
  DEBUG: $BooleanLike.optional(),
  MONGO_DIRECT_CONNECTION: $BooleanLike.optional(),
  MONGO_REPLICA_SET: z.enum(['rs0']).optional(),
  MONGO_RETRY_WRITES: $BooleanLike.optional(),
  MONGO_URI: $UrlLike,
  MONGO_WRITE_CONCERN: z.enum(['majority']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  SECRET_KEY: z.string().min(16),
  THROTTLER_ENABLED: $BooleanLike.default(true),
  VERBOSE: $BooleanLike.optional()
});

/**
 * Type representing the runtime environment configuration.
 *
 * Users can extend the {@link $BaseEnv} schema in their application. Any extended
 * schema must have, as it's output, a type that is assignable to this type.
 *
 * @see {@link $BaseEnv}
 */
export type BaseEnv = z.infer<typeof $BaseEnv>;

export type NodeEnv = BaseEnv['NODE_ENV'];

export type RuntimeEnv = UserConfig extends { RuntimeEnv: infer TRuntimeEnv extends BaseEnv } ? TRuntimeEnv : BaseEnv;
