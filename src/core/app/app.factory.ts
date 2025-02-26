import { filterObject, safeParse, ValidationException } from '@douglasneuroinformatics/libjs';
import type { Result } from 'neverthrow';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import { AppContainer } from './app.container.js';
import { AppModule } from './app.module.js';

import type { RuntimeEnv } from '../../config/schema.js';
import type { CreateAppContainerOptions } from './app.container.js';
import type { CreateAppModuleOptions } from './app.module.js';

type EnvSchema = z.ZodType<RuntimeEnv, z.ZodTypeDef, { [key: string]: string }>;

export type CreateAppOptions = Simplify<
  Omit<CreateAppModuleOptions, 'config'> &
    Pick<CreateAppContainerOptions, 'docs' | 'version'> & {
      schema: EnvSchema;
    }
>;

export class AppFactory {
  static create({
    docs,
    imports = [],
    providers = [],
    schema,
    version
  }: CreateAppOptions): Result<AppContainer, typeof ValidationException.Instance> {
    return this.parseConfig(schema).map((config) => {
      const module = AppModule.create({ config, imports, providers });
      return new AppContainer({
        config,
        docs,
        module,
        version
      });
    });
  }

  private static parseConfig($Schema: EnvSchema): Result<RuntimeEnv, typeof ValidationException.Instance> {
    return safeParse(
      filterObject(process.env, (value) => value !== ''),
      $Schema
    );
  }
}
