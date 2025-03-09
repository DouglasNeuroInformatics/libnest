import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { MockFactory } from '../../../testing/index.js';
import { AUTH_MODULE_OPTIONS_TOKEN } from '../auth.config.js';
import { AuthController } from '../auth.controller.js';
import { AuthService } from '../auth.service.js';

import type { MockedInstance } from '../../../testing/index.js';
import type { AuthModuleOptions } from '../auth.config.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: MockedInstance<AuthService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS_TOKEN,
          useValue: {
            loginCredentialsSchema: z.object({
              password: z.string().min(1),
              username: z.string().min(1)
            })
          } satisfies Partial<AuthModuleOptions>
        },
        MockFactory.createForService(AuthService)
      ]
    }).compile();
    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
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

    it('should call the `AuthService` with the request body', async () => {
      await authController.login(loginRequest);
      expect(authService.login.mock.lastCall).toMatchObject([loginRequest]);
    });

    it('should return the same value returned by `AuthService`', async () => {
      authService.login.mockResolvedValueOnce({ accessToken: '123' });
      const returnValue = await authController.login(loginRequest);
      expect(returnValue).toMatchObject({ accessToken: '123' });
    });
  });
});
