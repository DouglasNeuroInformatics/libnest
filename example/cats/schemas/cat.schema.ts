import { z } from 'zod/v4';

export type $Cat = z.infer<typeof $Cat>;
export const $Cat = z.object({
  _id: z.uuid(),
  age: z.number(),
  name: z.string()
});

export type $CreateCatData = z.infer<typeof $CreateCatData>;
export const $CreateCatData = $Cat.omit({ _id: true });
