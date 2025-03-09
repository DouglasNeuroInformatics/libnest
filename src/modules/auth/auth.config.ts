import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { Promisable } from 'type-fest';
import type { z } from 'zod';

type BaseLoginCredentials = {
  password: string;
};

type BaseLoginCredentialsSchema = z.ZodType<BaseLoginCredentials>;

type UserQueryResult = {
  hashedPassword: string;
  tokenPayload: {
    [key: string]: unknown;
  };
};

type UserQuery<TLoginCredentials extends BaseLoginCredentials = BaseLoginCredentials> = (
  credentials: TLoginCredentials
) => Promisable<null | UserQueryResult>;

type LoginResponseBody = {
  accessToken: string;
};

type AuthModuleOptions<TLoginCredentialsSchema extends BaseLoginCredentialsSchema = BaseLoginCredentialsSchema> = {
  loginCredentialsSchema: TLoginCredentialsSchema;
  userQuery: UserQuery<z.TypeOf<TLoginCredentialsSchema>>;
};

const { ConfigurableModuleClass: ConfigurableAuthModule, MODULE_OPTIONS_TOKEN: AUTH_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AuthModuleOptions<any>>()
    .setClassMethodName('forRoot')
    .setExtras({}, (definition) => ({
      ...definition,
      global: true
    }))
    .build();

export { AUTH_MODULE_OPTIONS_TOKEN, ConfigurableAuthModule };
export type { AuthModuleOptions, BaseLoginCredentials, LoginResponseBody, UserQuery, UserQueryResult };
