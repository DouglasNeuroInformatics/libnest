import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import type { AppRequest } from '../types.js';

type CurrentUserDecorator = (key: Extract<keyof AppRequest['user'], string>) => ParameterDecorator;

/**
 * Extract the user from the request object
 * @param key - the key of the user object to extract, or omit for the entire user
 */
export const CurrentUser: CurrentUserDecorator = createParamDecorator<
  Extract<keyof AppRequest['user'], string>,
  ExecutionContext
>((key, context) => {
  const request = context.switchToHttp().getRequest<AppRequest>();
  if (key) {
    return request.user?.[key];
  }
  return request.user;
});
