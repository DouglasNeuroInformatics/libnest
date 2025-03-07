import { InternalServerErrorException, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '../config/config.service.js';
import { JSONLogger } from '../logging/json.logger.js';
import { getModelToken } from '../prisma/prisma.utils.js';
import { USER_QUERY_TOKEN } from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

import type { UserModelName } from '../prisma/prisma.types.js';
import type { AuthOptions, UserQuery } from './auth.config.js';

@Module({})
export class AuthModule {
  static forRoot<TUserModelName extends UserModelName>(options: AuthOptions<TUserModelName>): DynamicModule {
    if (!options.enabled) {
      return {
        module: AuthModule
      };
    }
    return {
      controllers: [AuthController],
      imports: [
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('SECRET_KEY')
          })
        })
      ],
      module: AuthModule,
      providers: [
        {
          inject: [getModelToken(options.userModel)],
          provide: USER_QUERY_TOKEN,
          useFactory: (userModel: {
            findFirst: (args: { where: { username: string } }) => Promise<null | { [key: string]: unknown }>;
          }): UserQuery => {
            const logger = new JSONLogger('UserQuery');
            return async (username: string) => {
              const user = await userModel.findFirst({ where: { username } });
              if (!user) {
                return null;
              }

              const hashedPassword = user.hashedPassword;
              if (typeof hashedPassword !== 'string') {
                logger.error(`Unexpected type of property 'hashedPassword': ${typeof hashedPassword}`);
                throw new InternalServerErrorException();
              }

              const tokenPayload: { [key: string]: unknown } = {};
              options.tokenPayload.forEach((key) => {
                const value = user[key];
                if (value === undefined) {
                  logger.error(`Cannot create token payload: property '${key}' on user is not defined`);
                  throw new InternalServerErrorException();
                }
                tokenPayload[key] = value;
              });

              return { hashedPassword, tokenPayload };
            };
          }
        },
        AuthService
      ]
    };
  }
}
