import { z } from 'zod';

export type ConfigOptions = z.infer<typeof $ConfigOptions>;
export const $ConfigOptions = z.object({
  entry: z.string().min(1),
  globals: z.record(z.unknown()).optional()
});

export type BootstrapFunction = z.infer<typeof $BootstrapFunction>;
export const $BootstrapFunction = z.function().returns(z.promise(z.void()));
