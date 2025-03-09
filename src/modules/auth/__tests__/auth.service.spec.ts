import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { z } from 'zod';

import { MockFactory } from '../../../testing/index.js';
import { CryptoService } from '../../crypto/crypto.service.js';
import { AUTH_MODULE_OPTIONS_TOKEN } from '../auth.config.js';
import { AuthService } from '../auth.service.js';

import type { MockedInstance } from '../../../testing/index.js';
import type { AuthModuleOptions } from '../auth.config.js';

describe('AuthService', () => {
  let authService: AuthService;
  let cryptoService: MockedInstance<CryptoService>;
  let jwtService: MockedInstance<JwtService>;

  let userQuery: Mock;

  beforeEach(async () => {
    userQuery = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS_TOKEN,
          useValue: {
            loginCredentialsSchema: z.object({
              password: z.string().min(1),
              username: z.string().min(1)
            }),
            userQuery
          } satisfies AuthModuleOptions
        },
        AuthService,
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(JwtService)
      ]
    }).compile();
    authService = moduleRef.get(AuthService);
    cryptoService = moduleRef.get(CryptoService);
    jwtService = moduleRef.get(JwtService);
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
