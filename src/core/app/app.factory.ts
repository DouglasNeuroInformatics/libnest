import { filterObject, RuntimeException, safeParse, ValidationException } from '@douglasneuroinformatics/libjs';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import { AppContainer } from './app.container.js';
import { AppModule } from './app.module.js';

import type { BaseEnv } from '../../config/schema.js';
import type { CreateAppContainerOptions } from './app.container.js';
import type { CreateAppModuleOptions } from './app.module.js';

type EnvSchema = z.ZodType<BaseEnv, z.ZodTypeDef, { [key: string]: string }>;

export type CreateAppOptions = Simplify<
  Omit<CreateAppModuleOptions, 'config'> &
    Pick<CreateAppContainerOptions, 'docs' | 'version'> & {
      envSchema: EnvSchema;
    }
>;

export type CreateAppContainerResult<TOptions extends CreateAppOptions> = Result<
  AppContainer,
  typeof RuntimeException.Instance
> & {
  _inferOptions: TOptions;
};

export class AppFactory {
  static create<TOptions extends CreateAppOptions>({
    docs,
    envSchema,
    imports = [],
    prisma,
    providers = [],
    version
  }: TOptions): CreateAppContainerResult<TOptions> {
    return this.parseConfig(envSchema).match(
      (config) => {
        const module = AppModule.create({ config, imports, prisma, providers });
        return ok(
          new AppContainer({
            config,
            docs,
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
    ) satisfies Result<AppContainer, typeof RuntimeException.Instance> as CreateAppContainerResult<TOptions>;
  }

  private static parseConfig(envSchema: EnvSchema): Result<BaseEnv, typeof ValidationException.Instance> {
    return safeParse(
      filterObject(process.env, (value) => value !== ''),
      envSchema
    );
  }
}
