import { $BooleanLike, $UrlLike } from '@douglasneuroinformatics/libjs';
import { z } from 'zod/v4';

export const $MongoEnv = z.object({
  MONGO_DIRECT_CONNECTION: $BooleanLike.optional(),
  MONGO_REPLICA_SET: z.enum(['rs0']).optional(),
  MONGO_RETRY_WRITES: $BooleanLike.optional(),
  MONGO_URI: $UrlLike,
  MONGO_WRITE_CONCERN: z.enum(['majority']).optional()
});
