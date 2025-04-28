import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import type { Promisable } from 'type-fest';

import { RenderInterceptor } from '../interceptors/render.interceptor.js';
import { defineToken } from '../utils/token.utils.js';

import type { UserConfig } from '../user-config.js';

type ComponentsMap = UserConfig['Components'] extends infer TComponents extends {
  [key: string]: () => Promise<{ default: (...args: any[]) => any }>;
}
  ? {
      [K in keyof TComponents]: Awaited<ReturnType<TComponents[K]>>['default'];
    }
  : never;

export const { RENDER_COMPONENT_METADATA_KEY } = defineToken('RENDER_COMPONENT_METADATA_KEY');

export type RenderComponentOptions = {
  name: Extract<keyof ComponentsMap, string>;
};

export type RenderMethod = () => Promisable<{ [key: string]: unknown }>;

export type RenderComponentDecoratorType = <T extends RenderMethod>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => void;

export const RenderComponent = (options: RenderComponentOptions): RenderComponentDecoratorType => {
  return applyDecorators(SetMetadata(RENDER_COMPONENT_METADATA_KEY, options), UseInterceptors(RenderInterceptor));
};
