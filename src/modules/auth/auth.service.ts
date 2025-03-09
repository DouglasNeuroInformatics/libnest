import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from '../crypto/crypto.service.js';
import { AUTH_MODULE_OPTIONS_TOKEN } from './auth.config.js';

import type { AuthModuleOptions, BaseLoginCredentials, LoginResponseBody, UserQuery } from './auth.config.js';

@Injectable()
export class AuthService {
  private readonly userQuery: UserQuery;

  constructor(
    @Inject(AUTH_MODULE_OPTIONS_TOKEN) { userQuery }: AuthModuleOptions,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService
  ) {
    this.userQuery = userQuery;
  }

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
