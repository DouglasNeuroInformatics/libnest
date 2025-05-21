import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { MockFactory } from '../../../testing/index.js';
import { CryptoService } from '../../crypto/crypto.service.js';
import { LoggingService } from '../../logging/logging.service.js';
import { AbilityFactory } from '../ability.factory.js';
import { USER_QUERY_TOKEN } from '../auth.config.js';
import { AuthService } from '../auth.service.js';

import type { MockedInstance } from '../../../testing/index.js';

describe('AuthService', () => {
  let authService: AuthService;
  let abilityFactory: MockedInstance<AbilityFactory>;
  let cryptoService: MockedInstance<CryptoService>;
  let jwtService: MockedInstance<JwtService>;

  let userQuery: Mock;

  beforeEach(async () => {
    userQuery = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: USER_QUERY_TOKEN,
          useValue: userQuery
        },
        AuthService,
        MockFactory.createForService(AbilityFactory),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(JwtService),
        MockFactory.createForService(LoggingService)
      ]
    }).compile();
    abilityFactory = moduleRef.get(AbilityFactory);
    authService = moduleRef.get(AuthService);
    cryptoService = moduleRef.get(CryptoService);
    jwtService = moduleRef.get(JwtService);

    abilityFactory.createForPayload.mockReturnValue([]);
  });

  describe('login', () => {
    let loginRequest: {
      password: string;
      username: string;
    };

    beforeEach(() => {
      loginRequest = Object.freeze({
        password: 'Password123',
        username: 'admin'
      });
    });

    it('should throw an UnauthorizedException if the userQuery returns null', async () => {
      userQuery.mockResolvedValueOnce(null);
      await expect(authService.login(loginRequest)).rejects.toThrowError(
        new UnauthorizedException('Invalid Credentials')
      );
    });

    it('should throw an UnauthorizedException if the password is incorrect', async () => {
      userQuery.mockResolvedValueOnce({ hashedPassword: 'HASHED_PASSWORD' });
      cryptoService.comparePassword.mockResolvedValueOnce(false);
      await expect(authService.login(loginRequest)).rejects.toThrowError(
        new UnauthorizedException('Invalid Credentials')
      );
      expect(cryptoService.comparePassword).toHaveBeenCalledExactlyOnceWith(loginRequest.password, 'HASHED_PASSWORD');
    });

    it('should return an access token if the credentials are correct ', async () => {
      userQuery.mockResolvedValueOnce({ hashedPassword: 'HASHED_PASSWORD' });
      cryptoService.comparePassword.mockImplementationOnce((password, hashedPassword) => {
        return password === loginRequest.password && hashedPassword === 'HASHED_PASSWORD';
      });
      jwtService.signAsync.mockResolvedValueOnce('ACCESS_TOKEN');
      await expect(authService.login(loginRequest)).resolves.toStrictEqual({
        accessToken: 'ACCESS_TOKEN'
      });
    });
  });
});
