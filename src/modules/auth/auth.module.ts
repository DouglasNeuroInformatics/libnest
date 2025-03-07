import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '../config/config.service.js';
import { getModelToken } from '../prisma/prisma.utils.js';
import { USER_QUERY_TOKEN } from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

import type { UserModelName } from '../prisma/prisma.types.js';
import type { AuthOptions } from './auth.config.js';

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
          useFactory: (userModel: { findFirst: () => (where: { username: string }) => unknown }) => {
            return userModel;
          }
        },
        AuthService
      ]
    };
  }
}
