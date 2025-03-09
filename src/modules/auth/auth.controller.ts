import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { LoginCredentialsDto } from './dto/login-credentials.dto.js';

import type { LoginResponseBody } from './auth.config.js';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() credentials: LoginCredentialsDto): Promise<LoginResponseBody> {
    return this.authService.login(credentials);
  }
}
