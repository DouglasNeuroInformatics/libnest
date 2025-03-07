import type { Promisable } from 'type-fest';

import { defineToken } from '../../utils/token.utils.js';

import type { UserModelMap, UserModelName } from '../prisma/prisma.types.js';

type UserQueryResult = {
  hashedPassword: string;
  tokenPayload: {
    [key: string]: unknown;
  };
};

export type UserQuery = (username: string) => Promisable<null | UserQueryResult>;

export type AuthOptions<TUserModelName extends UserModelName> =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      tokenPayload: Extract<keyof UserModelMap[TUserModelName]['fields'], string>[];
      userModel: TUserModelName;
    };

export type AuthPayload = {
  accessToken: string;
};

export const { USER_QUERY_TOKEN } = defineToken('USER_QUERY_TOKEN');
