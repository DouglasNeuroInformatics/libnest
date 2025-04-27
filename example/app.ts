import { z } from 'zod';

import { $BaseEnv, AppFactory, AuthModule, CryptoService } from '../src/index.js';
import { AppController } from './app.controller.js';
import { CatsModule } from './cats/cats.module.js';

import type { UserQueryResult } from '../src/index.js';

export default AppFactory.create({
  controllers: [AppController],
  docs: {
    path: '/docs',
    title: 'Example API'
  },
  envSchema: $BaseEnv,
  imports: [
    AuthModule.forRootAsync({
      inject: [CryptoService],
      useFactory: (cryptoService: CryptoService) => {
        return {
          defineAbility: (ability, payload): void => {
            if (payload.isAdmin) {
              ability.can('manage', 'all');
            }
          },
          schemas: {
            loginCredentials: z.object({
              password: z.string().min(1),
              username: z.string().min(1)
            }),
            tokenPayload: z.object({
              isAdmin: z.boolean()
            })
          },
          userQuery: async ({ username }): Promise<null | UserQueryResult<{ isAdmin: true }>> => {
            if (username !== 'admin') {
              return null;
            }
            return {
              hashedPassword: await cryptoService.hashPassword('password'),
              tokenPayload: {
                isAdmin: true
              }
            };
          }
        };
      }
    }),
    CatsModule
  ],
  prisma: {
    dbPrefix: 'libnest-example',
    useInMemoryDbForTesting: true
  },
  version: null
});
