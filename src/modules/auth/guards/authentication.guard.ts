import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { ROUTE_ACCESS_METADATA_KEY } from '../../../decorators/route-access.decorator.js';
import { LoggingService } from '../../logging/logging.service.js';

import type { RouteAccessType } from '../../../decorators/route-access.decorator.js';

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  private readonly reflector = new Reflector();

  constructor(private readonly loggingService: LoggingService) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    this.loggingService.verbose(`Request URL: ${request.url}`);
    if (this.isPublicRoute(context)) {
      return true;
    }
    const isAuthenticated = await super.canActivate(context);
    if (isAuthenticated !== true) {
      return false;
    }
    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    const routeAccess = this.reflector.get<RouteAccessType | undefined>(
      ROUTE_ACCESS_METADATA_KEY,
      context.getHandler()
    );
    const result = routeAccess === 'public';
    this.loggingService.verbose(`Public Route: ${result}`);
    return result;
  }
}
