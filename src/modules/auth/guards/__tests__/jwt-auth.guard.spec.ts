import { InternalServerErrorException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { MockFactory } from '../../../../testing/index.js';
import { LoggingService } from '../../../logging/logging.service.js';
import { AbilityFactory } from '../../ability.factory.js';
import { JwtAuthGuard } from '../jwt-auth.guard.js';

import type { RouteAccessType } from '../../../../decorators/route-access.decorator.js';
import type { MockedInstance } from '../../../../testing/index.js';

const BaseConstructor = vi.hoisted(() => {
  const constructor = vi.fn();
  constructor.prototype.canActivate = vi.fn();
  return constructor;
});

vi.mock('@nestjs/passport', () => ({ AuthGuard: () => BaseConstructor }));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  let loggingService: MockedInstance<LoggingService>;
  let reflector: MockedInstance<Reflector>;

  let context: MockedInstance<ExecutionContext>;
  let getRequest: Mock<() => Partial<Request>>;

  beforeEach(() => {
    getRequest = vi.fn().mockReturnValue({ url: 'http://localhost:5500' });
    context = {
      getHandler: vi.fn(),
      switchToHttp: vi.fn(() => ({ getRequest, getResponse: vi.fn() }))
    } satisfies Partial<MockedInstance<ExecutionContext>> as MockedInstance<ExecutionContext>;
    loggingService = MockFactory.createMock(LoggingService);
    reflector = MockFactory.createMock(Reflector);
    guard = new JwtAuthGuard(loggingService as any, reflector);
  });

  it('should extend BaseConstructor', () => {
    expect(BaseConstructor).toHaveBeenCalled();
  });

  it('should return true for a public route', async () => {
    reflector.get.mockReturnValueOnce('public' satisfies RouteAccessType);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(loggingService.verbose).toHaveBeenCalledTimes(2);
    expect(loggingService.verbose).toHaveBeenLastCalledWith('Granting access for public route: http://localhost:5500');
  });

  it('should throw an InternalServerError if RouteAccess is not defined for a route', async () => {
    reflector.get.mockReturnValueOnce(undefined);
    await expect(guard.canActivate(context)).rejects.toThrowError(InternalServerErrorException);
    expect(loggingService.error).toHaveBeenLastCalledWith(`Route access is not defined for url: http://localhost:5500`);
  });

  it('should return false for a protected route, if AuthGuard.canActivate returns false', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(false);
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should return false for a protected route, if AuthGuard.canActivate returns a truthy, non-boolean value', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce({});
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should throw an InternalServerError if, for some reason, there is no user ability for the request', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
    await expect(guard.canActivate(context)).rejects.toThrowError(InternalServerErrorException);
    expect(loggingService.error).toHaveBeenLastCalledWith(
      'User property of request does not include expected AppAbility'
    );
  });

  it('should return true for a protected route, if the user has the right permissions', async () => {
    reflector.get.mockReturnValueOnce({
      action: 'manage',
      subject: 'all'
    } satisfies RouteAccessType);
    BaseConstructor.prototype.canActivate.mockResolvedValueOnce(true);
    const ability = AbilityFactory.prototype.createForPermissions([{ action: 'manage', subject: 'all' }]);
    getRequest.mockReturnValueOnce({ url: 'http://localhost:5500', user: { ability } });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
