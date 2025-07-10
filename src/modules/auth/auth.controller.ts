import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { RouteAccess } from '../../decorators/route-access.decorator.js';
import { AuthService } from './auth.service.js';
import { LoginCredentialsDto } from './dto/login-credentials.dto.js';

import type { LoginResponseBody } from './auth.config.js';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @RouteAccess('public')
  async login(@Body() credentials: LoginCredentialsDto): Promise<LoginResponseBody> {
    return this.authService.login(credentials);
  }
}
