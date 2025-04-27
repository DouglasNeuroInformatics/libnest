import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import type { Promisable } from 'type-fest';

import { RenderInterceptor } from '../interceptors/render.interceptor.js';
import { defineToken } from '../utils/token.utils.js';

export const { RENDER_COMPONENT_METADATA_KEY } = defineToken('RENDER_COMPONENT_METADATA_KEY');

export type RenderComponentOptions = {
  filepath: string;
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
