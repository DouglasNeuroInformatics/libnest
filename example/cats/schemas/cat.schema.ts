import { z } from 'zod';

export type Cat = z.infer<typeof $Cat>;
export const $Cat = z.object({
  age: z.number(),
  name: z.string()
});
