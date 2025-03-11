import { AbilityBuilder, PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';
import type { z } from 'zod';

import { defineToken } from '../../utils/token.utils.js';

type FallbackIfNever<T, U> = [T] extends [never] ? U : T;

type AppAction = 'create' | 'delete' | 'manage' | 'read' | 'update';

type DefaultAppSubjects =
  | string
  | {
      [key: string]: unknown;
      __modelName: string;
    };

type RuntimeAppSubjects = Subjects<{
  [K in keyof Prisma.TypeMap['model']]: DefaultSelection<Prisma.TypeMap['model'][K]['payload']>;
}>;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type AppSubjects = 'all' | FallbackIfNever<RuntimeAppSubjects, DefaultAppSubjects>;

type AppSubjectName = Extract<AppSubjects, string>;

type AppAbilities = [AppAction, AppSubjects];

type AppConditions = FallbackIfNever<PrismaQuery, unknown>;

type AppAbility = PureAbility<AppAbilities, AppConditions>;

type DefineAbility<TPayload extends { [key: string]: unknown } = { [key: string]: unknown }> = (
  ability: AbilityBuilder<AppAbility>,
  tokenPayload: TPayload
) => void;

type Permission = RawRuleOf<PureAbility<[AppAction, AppSubjectName]>>;

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
  permissions: Permission[];
}

type UserQuery<TLoginCredentials extends BaseLoginCredentials = BaseLoginCredentials> = (
  credentials: TLoginCredentials
) => Promise<null | UserQueryResult>;

type LoginResponseBody = {
  accessToken: string;
};

type AuthModuleOptions<
  TLoginCredentialsSchema extends BaseLoginCredentialsSchema = BaseLoginCredentialsSchema,
  TUserQuery extends UserQuery<z.TypeOf<TLoginCredentialsSchema>> = UserQuery<z.TypeOf<TLoginCredentialsSchema>>
> = {
  defineAbility?: DefineAbility<NonNullable<Awaited<ReturnType<TUserQuery>>>['tokenPayload']>;
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

export const { DEFINE_ABILITY_TOKEN } = defineToken('DEFINE_ABILITY_TOKEN');

export type {
  AppAbilities,
  AppAbility,
  AppAction,
  AppConditions,
  AppSubjectName,
  AppSubjects,
  AuthModuleOptions,
  BaseLoginCredentials,
  BaseLoginCredentialsSchema,
  DefineAbility,
  JwtPayload,
  LoginResponseBody,
  Permission,
  UserQuery,
  UserQueryResult
};
