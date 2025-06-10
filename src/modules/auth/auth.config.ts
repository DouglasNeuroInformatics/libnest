import { AbilityBuilder, PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import type { FallbackIfNever } from '@douglasneuroinformatics/libjs';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';
import type { IfEmptyObject } from 'type-fest';
import type { z } from 'zod/v4';

import { defineToken } from '../../utils/token.utils.js';

import type { UserTypes } from '../../user-config.js';

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

type Permission = RawRuleOf<PureAbility<[AppAction, AppSubjectName], AppConditions>>;

type DefineAbility = (
  ability: AbilityBuilder<AppAbility>,
  tokenPayload: Omit<UserTypes.JwtPayload, 'permissions'>,
  metadata: IfEmptyObject<UserTypes.UserQueryMetadata, unknown, UserTypes.UserQueryMetadata>
) => void;

type BaseLoginCredentials = {
  password: string;
};

type BaseLoginCredentialsSchema = z.ZodType<BaseLoginCredentials>;

type UserQueryResult = IfEmptyObject<
  UserTypes.UserQueryMetadata,
  { metadata?: unknown },
  { metadata: UserTypes.UserQueryMetadata }
> & {
  hashedPassword: string;
  tokenPayload: Omit<UserTypes.JwtPayload, 'permissions'>;
};

type UserQuery<TLoginCredentials extends BaseLoginCredentials = BaseLoginCredentials> = (
  credentials: TLoginCredentials
) => Promise<null | UserQueryResult>;

type LoginResponseBody = {
  accessToken: string;
};

type AuthModuleOptions<TLoginCredentialsSchema extends BaseLoginCredentialsSchema = BaseLoginCredentialsSchema> = {
  defineAbility: DefineAbility;
  schemas: {
    loginCredentials: TLoginCredentialsSchema;
  };
  userQuery: UserQuery<z.output<TLoginCredentialsSchema>>;
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
  AuthModuleOptions,
  BaseLoginCredentials,
  BaseLoginCredentialsSchema,
  DefineAbility,
  LoginResponseBody,
  Permission,
  UserQuery,
  UserQueryResult
};
