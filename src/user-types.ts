import type { ConditionalKeys, IfEmptyObject } from 'type-fest';

import type { DefaultPrismaClientOptions } from './modules/prisma/prisma.config.js';
import type { BaseEnv } from './schemas/env.schema.js';
import type { UserConfig, UserTypes } from './user-config.js';

export type Locale = IfEmptyObject<UserTypes.Locales, string, ConditionalKeys<UserTypes.Locales, true>>;

export type RuntimeEnv = UserConfig extends { RuntimeEnv: infer TRuntimeEnv extends BaseEnv } ? TRuntimeEnv : BaseEnv;

export type RuntimePrismaClientOptions = UserConfig extends {
  RuntimePrismaClientOptions: infer TPrismaClientOptions extends DefaultPrismaClientOptions;
}
  ? TPrismaClientOptions
  : DefaultPrismaClientOptions;
