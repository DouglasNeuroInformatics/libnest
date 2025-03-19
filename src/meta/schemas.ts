import { z } from 'zod';

import type { UserConfigOptions } from '../user-config.js';

// we cannot use zod function here as we cannot have any wrappers apply and screw up toString representation
const $EntryFunction = z.custom<(...args: any[]) => any>((arg) => typeof arg === 'function');

export const $UserConfigOptions: z.ZodType<UserConfigOptions> = z.object({
  build: z.object({
    esbuildOptions: z.record(z.any()).optional(),
    mode: z.enum(['module', 'server']).optional(),
    outfile: z.string().min(1)
  }),
  entry: $EntryFunction,
  globals: z.record(z.any()).optional()
});
