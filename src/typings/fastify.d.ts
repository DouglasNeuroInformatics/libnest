import type { UserTypes } from '../user-config.ts';

declare module 'fastify' {
  interface FastifyRequest {
    accepts(): {
      languages(languages: UserTypes.Locale[]): false | string;
    };
    locale?: UserTypes.Locale;
    user?: UserTypes.RequestUser;
  }
}
