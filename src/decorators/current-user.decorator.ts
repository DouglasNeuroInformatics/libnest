import { createParamDecorator, InternalServerErrorException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { LiteralUnion, OmitIndexSignature } from 'type-fest';

type CurrentUserKey = LiteralUnion<
  Extract<keyof OmitIndexSignature<NonNullable<FastifyRequest['user']>>, string>,
  string
>;

type CurrentUserDecorator = (key?: CurrentUserKey) => ParameterDecorator;

/**
 * Extract the user from the request object
 * @param key - the key of the user object to extract, or omit for the entire user
 */
export const CurrentUser: CurrentUserDecorator = createParamDecorator((key, context) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>();
  if (!request.user) {
    throw new InternalServerErrorException('Request object does not include expected user property');
  } else if (key) {
    return request.user[key];
  }
  return request.user;
});
