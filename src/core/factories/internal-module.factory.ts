import type { DynamicModule } from '@nestjs/common';

export declare const internalModuleTag: unique symbol;

export type InternalDynamicModule = DynamicModule & {
  [internalModuleTag]?: unknown;
};

export class InternalModuleFactory {
  static createDynamicModule(module: DynamicModule): InternalDynamicModule {
    return module;
  }
}
