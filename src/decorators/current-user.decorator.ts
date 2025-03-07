import { createParamDecorator, InternalServerErrorException } from '@nestjs/common';
import type { Request } from 'express';

type CurrentUserDecorator = (key?: Extract<keyof NonNullable<Request['user']>, string>) => ParameterDecorator;

/**
 * Extract the user from the request object
 * @param key - the key of the user object to extract, or omit for the entire user
 */
export const CurrentUser: CurrentUserDecorator = createParamDecorator((key, context) => {
  const request = context.switchToHttp().getRequest<Request>();
  if (!request.user) {
    throw new InternalServerErrorException('Request object does not include expected user property');
  } else if (key) {
    return request.user[key];
  }
  return request.user;
});
