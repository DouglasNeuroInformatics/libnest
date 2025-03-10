import { AbilityBuilder, PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';
import type { IfNever } from 'type-fest';
import type { z } from 'zod';

type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

type AppSubjects = Subjects<{
  [K in keyof Prisma.TypeMap['model']]: DefaultSelection<Prisma.TypeMap['model'][K]['payload']>;
}>;

type AppSubjectName = IfNever<AppSubjects, string, Extract<AppSubjects, string>>;

type AppAbility = PureAbility<[AppAction, AppSubjects], PrismaQuery>;

type AbilityFactory = (ability: AbilityBuilder<AppAbility>) => AbilityBuilder<AppAbility>;

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

interface JwtPayload {
  [key: string]: any;
  permissions: RawRuleOf<PureAbility<[AppAction, AppSubjectName]>>[];
}

type UserQuery<TLoginCredentials extends BaseLoginCredentials = BaseLoginCredentials> = (
  credentials: TLoginCredentials
) => Promise<null | UserQueryResult>;

type LoginResponseBody = {
  accessToken: string;
};

type AuthModuleOptions<TLoginCredentialsSchema extends BaseLoginCredentialsSchema = BaseLoginCredentialsSchema> = {
  abilityFactory?: AbilityFactory;
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
export type {
  AbilityFactory,
  AppAbility,
  AppAction,
  AppSubjectName,
  AppSubjects,
  AuthModuleOptions,
  BaseLoginCredentials,
  BaseLoginCredentialsSchema,
  JwtPayload,
  LoginResponseBody,
  UserQuery,
  UserQueryResult
};
