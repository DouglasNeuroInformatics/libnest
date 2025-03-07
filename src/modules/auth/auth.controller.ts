import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginRequestDto } from './dto/login-request.dto.js';

import type { AuthPayload } from './auth.config.js';

@ApiTags('Authentication')
@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Request an access token using credentials', summary: 'Login' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginCredentials: LoginRequestDto): Promise<AuthPayload> {
    return this.authService.login(loginCredentials);
  }
}
