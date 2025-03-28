import { filterObject, RuntimeException, safeParse } from '@douglasneuroinformatics/libjs';
import type { z } from 'zod';

import type { BaseEnv } from '../schemas/env.schema.js';

export type BaseEnvSchema = z.ZodType<BaseEnv, z.ZodTypeDef, { [key: string]: string }>;

export function parseEnv<TSchema extends BaseEnvSchema = BaseEnvSchema>(schema: TSchema): z.TypeOf<TSchema> {
  // this is required so that these can be statically replaced in the bundle
  const env = { ...process.env, NODE_ENV: process.env.NODE_ENV };
  const envConfigResult = safeParse(
    filterObject(env, (value) => value !== ''),
    schema
  );
  if (envConfigResult.isErr()) {
    throw new RuntimeException('Failed to parse environment config', {
      cause: envConfigResult.error
    });
  }
  return envConfigResult.value;
}
