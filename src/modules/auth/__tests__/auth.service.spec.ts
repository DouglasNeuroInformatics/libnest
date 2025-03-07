import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { CryptoService } from '../../crypto/crypto.service.js';
import { USER_QUERY_TOKEN } from '../auth.config.js';
import { AuthService } from '../auth.service.js';

import type { MockedInstance } from '../../../testing/index.js';
import type { LoginRequestDto } from '../dto/login-request.dto.js';

describe('AuthService', () => {
  let authService: AuthService;
  let cryptoService: MockedInstance<CryptoService>;
  let jwtService: MockedInstance<JwtService>;
  let userQuery: Mock;

  beforeEach(async () => {
    userQuery = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(JwtService),
        {
          provide: USER_QUERY_TOKEN,
          useValue: userQuery
        }
      ]
    }).compile();
    authService = moduleRef.get(AuthService);
    cryptoService = moduleRef.get(CryptoService);
    jwtService = moduleRef.get(JwtService);
  });

  describe('login', () => {
    let loginRequest: LoginRequestDto;

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

    it('should throw an UnauthorizedException if the userQuery returns null', async () => {
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
