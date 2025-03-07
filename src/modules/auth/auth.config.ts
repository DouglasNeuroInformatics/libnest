import type { Promisable } from 'type-fest';

import { defineToken } from '../../utils/token.utils.js';

import type { UserModelName } from '../prisma/prisma.types.js';

type UserQueryResult = {
  hashedPassword: string;
  tokenPayload: {
    [key: string]: unknown;
  };
};

export type UserQuery = (username: string) => Promisable<null | UserQueryResult>;

export type AuthOptions<TUserModel extends UserModelName> =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      userModel: TUserModel;
    };

export type AuthPayload = {
  accessToken: string;
};

export const { USER_QUERY_TOKEN } = defineToken('USER_QUERY_TOKEN');
