import { Module } from '@nestjs/common';
import type { ConfigurableModuleAsyncOptions, DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { z } from 'zod';

import { ConfigService } from '../config/config.service.js';
import { ConfigurableAuthModule } from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

import type { AuthModuleOptions, BaseLoginCredentials } from './auth.config.js';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY')
      })
    })
  ],
  providers: [AuthService]
})
export class AuthModule extends ConfigurableAuthModule {
  static forRoot<TLoginCredentialsSchema extends z.ZodType<BaseLoginCredentials>>(
    options: AuthModuleOptions<TLoginCredentialsSchema>
  ): DynamicModule {
    return super.forRoot(options);
  }
  static forRootAsync<TLoginCredentialsSchema extends z.ZodType<BaseLoginCredentials>>(
    options: ConfigurableModuleAsyncOptions<AuthModuleOptions<TLoginCredentialsSchema>, 'create'>
  ): DynamicModule {
    return super.forRootAsync(options);
  }
}
