import { z } from 'zod';

export type Cat = z.infer<typeof $Cat>;
export const $Cat = z.object({
  _id: z.string().uuid(),
  age: z.number(),
  name: z.string()
});
