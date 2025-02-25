import { filterObject } from '@douglasneuroinformatics/libjs';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import { EnvironmentSchemaValidationException } from '../exceptions/environment-schema-validation.exception.js';
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
  static create({ docs, imports = [], providers = [], schema, version }: CreateAppOptions): AppContainer {
    const config = this.parseConfig(schema);
    const module = AppModule.create({ config, imports, providers });
    return new AppContainer({
      config,
      docs,
      module,
      version
    });
  }

  private static parseConfig(schema: EnvSchema): RuntimeEnv {
    const input = filterObject(process.env, (value) => value !== '');
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new EnvironmentSchemaValidationException({
        details: {
          issues: result.error.issues
        }
      });
    }
    return result.data;
  }
}
