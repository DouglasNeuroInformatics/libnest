/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod/v4';

import { $BaseEnv, AppFactory, AuthModule, CryptoService } from '../src/index.js';
import { AppController } from './app.controller.js';
import { CatsModule } from './cats/cats.module.js';

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
          defineAbility: (ability, payload) => {
            // We cannot correctly declare UserTypes here until we migrate to a monorepo setup
            if ((payload as { isAdmin: true }).isAdmin) {
              ability.can('manage', 'all');
            }
          },
          schemas: {
            loginCredentials: z.object({
              password: z.string().min(1),
              username: z.string().min(1)
            })
          },
          userQuery: async ({ username }) => {
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
  jsx: {
    baseDir: import.meta.dirname,
    importMap: {
      index: () => import('./pages/index.js')
    }
  },
  prisma: {
    useFactory: () => {
      return {
        client: new PrismaClient({
          datasourceUrl: 'mongodb://localhost:27017/libnest-example'
        })
      };
    }
  },
  version: null
});
