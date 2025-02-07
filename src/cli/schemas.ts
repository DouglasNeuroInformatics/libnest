import { z } from 'zod';

import { resolveAbsoluteImportPath } from './utils.js';

export type ConfigOptions = z.infer<typeof $ConfigOptions>;
export const $ConfigOptions = z.object({
  entry: z.string().transform((arg, ctx) => {
    const result = resolveAbsoluteImportPath(arg);
    if (result.isErr()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error
      });
      return z.NEVER;
    }
    return result.value;
  }),
  globals: z.record(z.unknown()).optional()
});

export const $BootstrapFunction = z.function().returns(z.promise(z.void()));
