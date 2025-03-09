import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Observable } from 'rxjs';

import { ROUTE_ACCESS_METADATA_KEY } from '../../../decorators/route-access.decorator.js';
import { LoggingService } from '../../logging/logging.service.js';

import type { RouteAccessType } from '../../../decorators/route-access.decorator.js';

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  private readonly reflector = new Reflector();

  constructor(private readonly loggingService: LoggingService) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Observable<boolean> | Promise<boolean> {
    this.loggingService.verbose(`Request URL: ${context.switchToHttp().getRequest<Request>().url}`);
    return this.isPublicRoute(context) || super.canActivate(context);
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
