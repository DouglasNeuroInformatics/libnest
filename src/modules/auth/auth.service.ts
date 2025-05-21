import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from '../crypto/crypto.service.js';
import { LoggingService } from '../logging/logging.service.js';
import { AbilityFactory } from './ability.factory.js';
import { USER_QUERY_TOKEN } from './auth.config.js';

import type { BaseLoginCredentials, JwtPayload, LoginResponseBody, UserQuery } from './auth.config.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_QUERY_TOKEN) private readonly userQuery: UserQuery,
    private readonly abilityFactory: AbilityFactory,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly loggingService: LoggingService
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

    const ability = this.abilityFactory.createForPayload(user.tokenPayload);

    return { accessToken: await this.signToken({ ...user.tokenPayload, permissions: ability.rules }) };
  }

  private async signToken(payload: JwtPayload): Promise<string> {
    this.loggingService.verbose({
      message: 'Signing JWT',
      payload
    });
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d'
    });
  }
}
