import { NotFoundException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import type { ExpressAdapter } from '@nestjs/platform-express';
import { beforeEach, describe, it, vi } from 'vitest';

import { ExceptionHandler } from '../exception.handler.js';

import type { MockedInstance } from '../../../testing/index.js';

describe('ExceptionHandler', () => {
  let exceptionHandler: ExceptionHandler;

  let argumentsHost: MockedInstance<ArgumentsHost>;
  let httpAdapterHost: MockedInstance<HttpAdapterHost<ExpressAdapter>>;

  beforeEach(() => {
    argumentsHost = {
      getArgByIndex: vi.fn(),
      getArgs: vi.fn(),
      getType: vi.fn(),
      switchToHttp: vi.fn(() => ({
        getRequest: vi.fn(),
        getResponse: vi.fn()
      })),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn()
    };
    httpAdapterHost = {
      httpAdapter: {
        getRequestUrl: vi.fn(),
        reply: vi.fn()
      }
    };
    exceptionHandler = new ExceptionHandler(httpAdapterHost as HttpAdapterHost<ExpressAdapter>);
  });

  describe('catch', () => {
    it('should correctly handle instances of HttpException', () => {
      exceptionHandler.catch(new NotFoundException(), argumentsHost);
    });
  });
});
