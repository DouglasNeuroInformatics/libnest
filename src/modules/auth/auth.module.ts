import { Inject, Module } from '@nestjs/common';
import type { ConfigurableModuleAsyncOptions, DynamicModule, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { applyValidationSchema } from '../../utils/validation.utils.js';
import { ConfigService } from '../config/config.service.js';
import { AbilityFactory } from './ability.factory.js';
import {
  AUTH_MODULE_OPTIONS_TOKEN,
  ConfigurableAuthModule,
  DEFINE_ABILITY_TOKEN,
  USER_QUERY_TOKEN
} from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginCredentialsDto } from './dto/login-credentials.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { TokenService } from './token.service.js';

import type { AuthModuleOptions, BaseLoginCredentialsSchema } from './auth.config.js';

@Module({
  controllers: [AuthController],
  exports: [TokenService],
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
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      inject: [AUTH_MODULE_OPTIONS_TOKEN],
      provide: USER_QUERY_TOKEN,
      useFactory: (options: AuthModuleOptions): AuthModuleOptions['userQuery'] => {
        return options.userQuery;
      }
    },
    {
      inject: [AUTH_MODULE_OPTIONS_TOKEN],
      provide: DEFINE_ABILITY_TOKEN,
      useFactory: (options: AuthModuleOptions): AuthModuleOptions['defineAbility'] => {
        return options.defineAbility;
      }
    }
  ]
})
export class AuthModule extends ConfigurableAuthModule implements OnModuleInit {
  private readonly loginCredentialsSchema: BaseLoginCredentialsSchema;

  constructor(@Inject(AUTH_MODULE_OPTIONS_TOKEN) { schemas }: AuthModuleOptions) {
    super();
    this.loginCredentialsSchema = schemas.loginCredentials;
  }

  static forRoot<TLoginCredentialsSchema extends BaseLoginCredentialsSchema>(
    options: AuthModuleOptions<TLoginCredentialsSchema>
  ): DynamicModule {
    return super.forRoot(options);
  }
  static forRootAsync<TLoginCredentialsSchema extends BaseLoginCredentialsSchema>(
    options: ConfigurableModuleAsyncOptions<AuthModuleOptions<TLoginCredentialsSchema>, 'create'>
  ): DynamicModule {
    return super.forRootAsync(options);
  }

  onModuleInit(): void {
    applyValidationSchema(LoginCredentialsDto, this.loginCredentialsSchema);
  }
}
