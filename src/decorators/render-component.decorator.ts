import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

import { RenderInterceptor } from '../interceptors/render.interceptor.js';
import { defineToken } from '../utils/token.utils.js';

export const { RENDER_COMPONENT_METADATA_KEY } = defineToken('RENDER_COMPONENT_METADATA_KEY');

export type RenderComponentOptions = {
  filepath: string;
};

export const RenderComponent = (options: RenderComponentOptions): MethodDecorator => {
  return applyDecorators(SetMetadata(RENDER_COMPONENT_METADATA_KEY, options), UseInterceptors(RenderInterceptor));
};
