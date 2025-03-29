import { z } from 'zod';

export type MongoStats = z.infer<typeof $MongoStats>;
export const $MongoStats = z.object({
  collections: z.number(),
  db: z.string(),
  objects: z.number()
});
