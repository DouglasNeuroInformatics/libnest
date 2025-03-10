import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from '../crypto/crypto.service.js';
import { USER_QUERY_TOKEN } from './auth.config.js';

import type { BaseLoginCredentials, LoginResponseBody, UserQuery } from './auth.config.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_QUERY_TOKEN) private readonly userQuery: UserQuery,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService
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

    return { accessToken: await this.signToken(user.tokenPayload) };
  }

  private async signToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d'
    });
  }
}
