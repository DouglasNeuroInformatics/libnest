import { isNumberLike, parseNumber } from '@douglasneuroinformatics/libjs';
import { z } from 'zod';

export const $BaseRuntimeConfig = z.object({
  API_DEV_SERVER_PORT: z
    .string()
    .optional()
    .transform((arg) => (isNumberLike(arg) ? parseNumber(arg) : arg))
    .pipe(z.number().int().nonnegative()),
  DEBUG: z
    .enum(['true', 'false'])
    .optional()
    .transform((arg) => arg === 'true'),
  MONGO_DIRECT_CONNECTION: z.enum(['true', 'false']).optional(),
  MONGO_REPLICA_SET: z.enum(['rs0']).optional(),
  MONGO_RETRY_WRITES: z.enum(['true', 'false']).optional(),
  MONGO_URI: z.string().url(),
  MONGO_WRITE_CONCERN: z.enum(['majority']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  SECRET_KEY: z.string().min(16),
  VERBOSE: z
    .enum(['true', 'false'])
    .optional()
    .transform((arg) => arg === 'true')
});

export type BaseRuntimeConfig = z.infer<typeof $BaseRuntimeConfig>;
