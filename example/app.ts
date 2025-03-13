import { z } from 'zod';

import { $BaseEnv, AppContainer, AuthModule, CryptoService } from '../src/index.js';
import { CatsModule } from './cats/cats.module.js';

export default await AppContainer.create({
  docs: {
    config: {
      title: 'Example API'
    },
    path: '/spec.json'
  },
  envSchema: $BaseEnv,
  imports: [
    AuthModule.forRootAsync({
      inject: [CryptoService],
      useFactory: (cryptoService: CryptoService) => {
        return {
          defineAbility: (ability, payload: { isAdmin: boolean }) => {
            if (payload.isAdmin) {
              ability.can('manage', 'all');
            }
          },
          loginCredentialsSchema: z.object({
            password: z.string().min(1),
            username: z.string().min(1)
          }),
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
  prisma: {
    dbPrefix: null
  },
  version: '1'
});
