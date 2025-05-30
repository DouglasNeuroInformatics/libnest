import { AbilityBuilder, PureAbility } from '@casl/ability';
import type { RawRuleOf } from '@casl/ability';
import type { PrismaQuery, Subjects } from '@casl/prisma';
import type { FallbackIfNever } from '@douglasneuroinformatics/libjs';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { DefaultSelection } from '@prisma/client/runtime/library';
import type { IfNever } from 'type-fest';
import type { z } from 'zod/v4';

import { defineToken } from '../../utils/token.utils.js';

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

type DefineAbility<TPayload extends { [key: string]: unknown } = { [key: string]: unknown }, TMetadata = any> = (
  ability: AbilityBuilder<AppAbility>,
  tokenPayload: TPayload,
  metadata: TMetadata
) => void;

type Permission = RawRuleOf<PureAbility<[AppAction, AppSubjectName]>>;

type BaseLoginCredentials = {
  password: string;
};

type BaseLoginCredentialsSchema = z.ZodType<BaseLoginCredentials>;

interface JwtPayload {
  [key: string]: any;
  permissions: Permission[];
}

type UserQueryResult<
  TPayload extends { [key: string]: unknown } = { [key: string]: unknown },
  TMetadata = never
> = IfNever<TMetadata, {}, { metadata: TMetadata }> & {
  hashedPassword: string;
  tokenPayload: TPayload;
};

type UserQuery<
  TLoginCredentials extends BaseLoginCredentials = BaseLoginCredentials,
  TPayload extends { [key: string]: unknown } = { [key: string]: unknown },
  TMetadata = any
> = (credentials: TLoginCredentials) => Promise<null | UserQueryResult<TPayload, TMetadata>>;

type LoginResponseBody = {
  accessToken: string;
};

type AuthModuleOptions<
  TLoginCredentialsSchema extends BaseLoginCredentialsSchema = BaseLoginCredentialsSchema,
  TPayloadSchema extends z.ZodObject = z.ZodObject,
  TMetadataSchema extends z.ZodType = z.ZodNever
> = {
  defineAbility: (
    ability: AbilityBuilder<AppAbility>,
    tokenPayload: z.output<TPayloadSchema>,
    metadata: z.output<TMetadataSchema>
  ) => any;
  schemas: {
    loginCredentials: TLoginCredentialsSchema;
    metadata?: TMetadataSchema;
    tokenPayload: TPayloadSchema;
  };
  userQuery: UserQuery<z.output<TLoginCredentialsSchema>, z.output<TPayloadSchema>, z.output<TMetadataSchema>>;
};

export const { ConfigurableModuleClass: ConfigurableAuthModule, MODULE_OPTIONS_TOKEN: AUTH_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AuthModuleOptions<any, any, any>>()
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
  JwtPayload,
  LoginResponseBody,
  Permission,
  UserQuery,
  UserQueryResult
};
