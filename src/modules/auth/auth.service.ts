import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from '../crypto/crypto.service.js';
import { USER_QUERY_TOKEN } from './auth.config.js';

import type { AuthPayload, UserQuery } from './auth.config.js';
import type { LoginRequestDto } from './dto/login-request.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_QUERY_TOKEN) private readonly userQuery: UserQuery,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService
  ) {}

  async login({ password, username }: LoginRequestDto): Promise<AuthPayload> {
    const user = await this.userQuery(username);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const isCorrectPassword = await this.cryptoService.comparePassword(password, user.hashedPassword);
    if (isCorrectPassword !== true) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const accessToken = await this.signToken(user.tokenPayload);

    return Promise.resolve({ accessToken });
  }

  private async signToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '1d'
    });
  }
}
