import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { CryptoService } from '../crypto/crypto.service.js';
import { AbilityFactory } from './ability.factory.js';
import { USER_QUERY_TOKEN } from './auth.config.js';
import { TokenService } from './token.service.js';

import type { UserTypes } from '../../user-config.js';
import type { BaseLoginCredentials, LoginResponseBody, UserQuery } from './auth.config.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_QUERY_TOKEN) private readonly userQuery: UserQuery,
    private readonly abilityFactory: AbilityFactory,
    private readonly cryptoService: CryptoService,
    private readonly tokenService: TokenService
  ) {}

  async login(credentials: BaseLoginCredentials): Promise<LoginResponseBody> {
    const user = await this.userQuery(credentials);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const isCorrectPassword = await this.cryptoService.comparePassword(credentials.password, user.hashedPassword);
    if (isCorrectPassword !== true) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const ability = this.abilityFactory.createForPayload(user.tokenPayload, user.metadata);

    return {
      accessToken: await this.tokenService.signToken(
        {
          ...user.tokenPayload,
          permissions: ability.rules
        } satisfies UserTypes.JwtPayload,
        {
          expiresIn: '1d'
        }
      )
    };
  }
}
