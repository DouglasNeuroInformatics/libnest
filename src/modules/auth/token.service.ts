import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import { LoggingService } from '../logging/logging.service.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loggingService: LoggingService
  ) {}
  async signToken(payload: { [key: string]: unknown }, options?: JwtSignOptions): Promise<string> {
    this.loggingService.verbose({
      message: 'Signing JWT',
      payload
    });
    return this.jwtService.signAsync(payload, options);
  }

  async verifyToken(token: string, options?: JwtVerifyOptions): Promise<unknown> {
    this.loggingService.verbose({
      message: 'Verifying JWT'
    });
    return this.jwtService.verifyAsync(token, options) as Promise<unknown>;
  }
}
