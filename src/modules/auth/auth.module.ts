import { Inject, Module } from '@nestjs/common';
import type { ConfigurableModuleAsyncOptions, DynamicModule, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { z } from 'zod';

import { applyValidationSchema } from '../../utils/validation.utils.js';
import { ConfigService } from '../config/config.service.js';
import { AUTH_MODULE_OPTIONS_TOKEN, ConfigurableAuthModule } from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginCredentialsDto } from './dto/login-credentials.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

import type { AuthModuleOptions, BaseLoginCredentials, BaseLoginCredentialsSchema } from './auth.config.js';

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
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AuthModule extends ConfigurableAuthModule implements OnModuleInit {
  private readonly loginCredentialsSchema: BaseLoginCredentialsSchema;

  constructor(@Inject(AUTH_MODULE_OPTIONS_TOKEN) { loginCredentialsSchema }: AuthModuleOptions) {
    super();
    this.loginCredentialsSchema = loginCredentialsSchema;
  }

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

  onModuleInit() {
    applyValidationSchema(LoginCredentialsDto, this.loginCredentialsSchema);
  }
}
