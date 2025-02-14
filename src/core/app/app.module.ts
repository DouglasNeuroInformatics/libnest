import type { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';

import type { RuntimeConfig } from '../../user-config.js';

export type ImportedModule = NonNullable<ModuleMetadata['imports']>[number];

export type CreateAppModuleOptions = {
  config: RuntimeConfig;
  imports: ImportedModule[];
  providers: Provider[];
};

export class AppModule {
  static create({ imports, providers }: CreateAppModuleOptions): DynamicModule {
    return {
      imports,
      module: AppModule,
      providers
    };
  }
}
