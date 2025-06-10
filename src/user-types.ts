import type { DefaultPrismaClientOptions } from './modules/prisma/prisma.config.js';
import type { BaseEnv } from './schemas/env.schema.js';
import type { CustomTypeOptions, UserConfig } from './user-config.js';

export type RuntimeEnv = UserConfig extends { RuntimeEnv: infer TRuntimeEnv extends BaseEnv } ? TRuntimeEnv : BaseEnv;

export type RuntimePrismaClientOptions = UserConfig extends {
  RuntimePrismaClientOptions: infer TPrismaClientOptions extends DefaultPrismaClientOptions;
}
  ? TPrismaClientOptions
  : DefaultPrismaClientOptions;

export type RuntimeLocale = CustomTypeOptions extends { Locale: infer TLocale extends string } ? TLocale : string;
