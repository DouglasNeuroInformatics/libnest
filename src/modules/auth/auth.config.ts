import { AbilityBuilder, PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';
import type { IfNever } from 'type-fest';
import type { z } from 'zod';

import { defineToken } from '../../utils/token.utils.js';

type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

type AppSubjects = Subjects<{
  [K in keyof Prisma.TypeMap['model']]: DefaultSelection<Prisma.TypeMap['model'][K]['payload']>;
}>;

type AppSubjectName = IfNever<AppSubjects, string, Extract<AppSubjects, string>>;

type AppAbility = IfNever<
  AppSubjects,
  PureAbility<[AppAction, any], any>,
  PureAbility<[AppAction, AppSubjects], PrismaQuery>
>;

type AbilityModifier<TPayload extends { [key: string]: unknown } = { [key: string]: unknown }> = (
  abilityBuilder: AbilityBuilder<AppAbility>,
  tokenPayload: TPayload
) => AbilityBuilder<AppAbility>;

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

type AuthModuleOptions<
  TLoginCredentialsSchema extends BaseLoginCredentialsSchema = BaseLoginCredentialsSchema,
  TUserQuery extends UserQuery<z.TypeOf<NoInfer<TLoginCredentialsSchema>>> = UserQuery<
    z.TypeOf<NoInfer<TLoginCredentialsSchema>>
  >
> = {
  applyPermissions?: AbilityModifier<NonNullable<Awaited<ReturnType<NoInfer<TUserQuery>>>>['tokenPayload']>;
  loginCredentialsSchema: TLoginCredentialsSchema;
  userQuery: TUserQuery;
};

export const { ConfigurableModuleClass: ConfigurableAuthModule, MODULE_OPTIONS_TOKEN: AUTH_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AuthModuleOptions<any>>()
    .setClassMethodName('forRoot')
    .setExtras({}, (definition) => ({
      ...definition,
      global: true
    }))
    .build();

export const { USER_QUERY_TOKEN } = defineToken('USER_QUERY_TOKEN');

export const { APPLY_PERMISSIONS_TOKEN } = defineToken('APPLY_PERMISSIONS_TOKEN');

export type {
  AbilityModifier,
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
