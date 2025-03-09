import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import type { z } from 'zod';

import { parseRequestBody } from '../../utils/validation.utils.js';
import { AUTH_MODULE_OPTIONS_TOKEN } from './auth.config.js';
import { AuthService } from './auth.service.js';

import type { AuthModuleOptions, BaseLoginCredentials, LoginResponseBody } from './auth.config.js';

@Controller({ path: 'auth' })
export class AuthController {
  private readonly loginCredentialsSchema: z.ZodType<BaseLoginCredentials>;

  constructor(
    @Inject(AUTH_MODULE_OPTIONS_TOKEN) { loginCredentialsSchema }: AuthModuleOptions,
    private readonly authService: AuthService
  ) {
    this.loginCredentialsSchema = loginCredentialsSchema;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() requestBody: unknown): Promise<LoginResponseBody> {
    const credentials = await parseRequestBody(requestBody, this.loginCredentialsSchema);
    return this.authService.login(credentials);
  }
}
