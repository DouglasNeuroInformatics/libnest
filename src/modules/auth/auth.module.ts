import { Inject, Module } from '@nestjs/common';
import type { ConfigurableModuleAsyncOptions, DynamicModule, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { z } from 'zod';

import { applyValidationSchema } from '../../utils/validation.utils.js';
import { ConfigService } from '../config/config.service.js';
import { AbilityFactory } from './ability.factory.js';
import {
  APPLY_PERMISSIONS_TOKEN,
  AUTH_MODULE_OPTIONS_TOKEN,
  ConfigurableAuthModule,
  USER_QUERY_TOKEN
} from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginCredentialsDto } from './dto/login-credentials.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

import type { AuthModuleOptions, BaseLoginCredentials, BaseLoginCredentialsSchema, UserQuery } from './auth.config.js';

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
    AbilityFactory,
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      inject: [AUTH_MODULE_OPTIONS_TOKEN],
      provide: USER_QUERY_TOKEN,
      useFactory: (options: AuthModuleOptions) => {
        return options.userQuery;
      }
    },
    {
      inject: [AUTH_MODULE_OPTIONS_TOKEN],
      provide: APPLY_PERMISSIONS_TOKEN,
      useFactory: (options: AuthModuleOptions) => {
        return options.applyPermissions;
      }
    }
  ]
})
export class AuthModule extends ConfigurableAuthModule implements OnModuleInit {
  private readonly loginCredentialsSchema: BaseLoginCredentialsSchema;

  constructor(@Inject(AUTH_MODULE_OPTIONS_TOKEN) { loginCredentialsSchema }: AuthModuleOptions) {
    super();
    this.loginCredentialsSchema = loginCredentialsSchema;
  }

  static forRoot<
    TLoginCredentialsSchema extends z.ZodType<BaseLoginCredentials>,
    TUserQuery extends UserQuery<z.TypeOf<NoInfer<TLoginCredentialsSchema>>>
  >(options: AuthModuleOptions<TLoginCredentialsSchema, TUserQuery>): DynamicModule {
    return super.forRoot(options);
  }
  static forRootAsync<
    TLoginCredentialsSchema extends z.ZodType<BaseLoginCredentials>,
    TUserQuery extends UserQuery<z.TypeOf<NoInfer<TLoginCredentialsSchema>>>
  >(
    options: ConfigurableModuleAsyncOptions<AuthModuleOptions<TLoginCredentialsSchema, TUserQuery>, 'create'>
  ): DynamicModule {
    return super.forRootAsync(options);
  }

  onModuleInit() {
    applyValidationSchema(LoginCredentialsDto, this.loginCredentialsSchema);
  }
}
