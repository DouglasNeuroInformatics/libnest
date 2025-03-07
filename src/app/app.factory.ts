import { filterObject, RuntimeException, safeParse, ValidationException } from '@douglasneuroinformatics/libjs';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import { AppContainer } from './app.container.js';
import { AppModule } from './app.module.js';

import type { BaseEnv } from '../schemas/env.schema.js';
import type { CreateAppContainerOptions } from './app.container.js';
import type { CreateAppModuleOptions } from './app.module.js';

type EnvSchema = z.ZodType<BaseEnv, z.ZodTypeDef, { [key: string]: string }>;

export type CreateAppOptions<TEnvSchema extends EnvSchema = EnvSchema> = Simplify<
  Omit<CreateAppModuleOptions<z.TypeOf<TEnvSchema>>, 'envConfig'> &
    Pick<CreateAppContainerOptions, 'docs' | 'version'> & {
      envSchema: TEnvSchema;
    }
>;

export type CreateAppContainerResult<TEnvSchema extends EnvSchema> = Result<
  AppContainer,
  typeof RuntimeException.Instance
> & {
  __inferredEnvSchema: TEnvSchema;
};

export class AppFactory {
  static create<TEnvSchema extends EnvSchema>({
    docs,
    envSchema,
    imports = [],
    prisma,
    providers = [],
    version
  }: CreateAppOptions<TEnvSchema>): CreateAppContainerResult<TEnvSchema> {
    return this.parseEnv(envSchema).match(
      (envConfig) => {
        const module = AppModule.create({ envConfig, imports, prisma, providers });
        return ok(
          new AppContainer({
            docs,
            envConfig,
            module,
            version
          })
        );
      },
      (err) => {
        return RuntimeException.asErr('Failed to parse environment config', {
          cause: err
        });
      }
    ) satisfies Result<AppContainer, typeof RuntimeException.Instance> as CreateAppContainerResult<TEnvSchema>;
  }

  private static parseEnv(envSchema: EnvSchema): Result<BaseEnv, typeof ValidationException.Instance> {
    return safeParse(
      filterObject(process.env, (value) => value !== ''),
      envSchema
    );
  }
}
