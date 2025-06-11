import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, it } from 'vitest';

import { MockFactory } from '../../../testing/index.js';
import { LoggingService } from '../../logging/logging.service.js';
import { TokenService } from '../token.service.js';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: '123'
        })
      ],
      providers: [MockFactory.createForService(LoggingService), TokenService]
    }).compile();
    tokenService = moduleRef.get(TokenService);
  });

  it('should sign and verify tokens', async () => {
    const token = await tokenService.signToken({ isAdmin: true });
    const payload = await tokenService.verifyToken(token);
    expect(payload).toMatchObject({ isAdmin: true });
  });
});
