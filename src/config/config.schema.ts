import { $BooleanLike, $NumberLike } from '@douglasneuroinformatics/libjs';
import { z } from 'zod';

/**
 * Schema definition for the base runtime configuration.
 *
 * This schema validates and transforms environment variables used in the application. Users
 * can extend this schema to include additional configuration parameters.
 *
 * @see {@link BaseRuntimeConfig}
 * @see {@link user-config!RuntimeConfig | RuntimeConfig}
 */
export const $BaseRuntimeConfig = z.object({
  API_DEV_SERVER_PORT: $NumberLike.pipe(z.number().int().nonnegative()),
  API_PROD_SERVER_PORT: $NumberLike.pipe(z.number().int().nonnegative()).default(80),
  DEBUG: $BooleanLike.optional(),
  MONGO_DIRECT_CONNECTION: $BooleanLike.optional(),
  MONGO_REPLICA_SET: z.enum(['rs0']).optional(),
  MONGO_RETRY_WRITES: $BooleanLike.optional(),
  MONGO_URI: z.string().url(),
  MONGO_WRITE_CONCERN: z.enum(['majority']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  SECRET_KEY: z.string().min(16),
  THROTTLER_ENABLED: $BooleanLike.default(true),
  VERBOSE: $BooleanLike.optional()
});

/**
 * Type representing the base runtime configuration.
 *
 * Users can extend the {@link $BaseRuntimeConfig} schema in their application.
 * Any extended schema must have, as it's output, a type that is assignable to this type.
 *
 * @see {@link $BaseRuntimeConfig}
 * @see {@link user-config!RuntimeConfig | RuntimeConfig}
 */
export type BaseRuntimeConfig = z.infer<typeof $BaseRuntimeConfig>;
