import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '../config/config.service.js';
import { PRISMA_CLIENT_TOKEN } from '../prisma/prisma.config.js';
import { USER_QUERY_TOKEN } from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

import type { UserModelName } from '../prisma/prisma.types.js';
import type { AuthOptions } from './auth.config.js';

@Module({})
export class AuthModule {
  static forRoot<TUserModel extends UserModelName>(options: AuthOptions<TUserModel>): DynamicModule {
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
          inject: [PRISMA_CLIENT_TOKEN],
          provide: USER_QUERY_TOKEN,
          useFactory: () => {
            return;
          }
        },
        AuthService
      ]
    };
  }
}
