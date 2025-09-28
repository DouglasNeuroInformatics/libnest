import type { UserTypes } from './user-config.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserTypes.RequestUser;
  }
}
