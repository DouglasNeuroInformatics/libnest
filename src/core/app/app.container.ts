import type { RuntimeEnv } from '../../config/schema.js';
import type { CreateAppContainerOptions, DynamicAppModule } from './app.types.js';

export class AppContainer {
  config: RuntimeEnv;
  module: DynamicAppModule;

  constructor({ config, module }: CreateAppContainerOptions) {
    this.config = config;
    this.module = module;
  }
}
