import { HttpStatus, NotFoundException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import type { ExpressAdapter } from '@nestjs/platform-express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { ExceptionHandler } from '../exception.handler.js';

import type { MockedInstance } from '../../../testing/index.js';

describe('ExceptionHandler', () => {
  let exceptionHandler: ExceptionHandler;

  let argumentsHost: MockedInstance<ArgumentsHost>;
  let httpAdapter: Partial<MockedInstance<ExpressAdapter>>;
  let httpAdapterHost: MockedInstance<HttpAdapterHost<ExpressAdapter>>;
  let mockRequest: Mock;
  let mockResponse: Mock;

  beforeEach(() => {
    mockRequest = vi.fn();
    mockResponse = vi.fn();
    argumentsHost = {
      getArgByIndex: vi.fn(),
      getArgs: vi.fn(),
      getType: vi.fn(),
      switchToHttp: vi.fn(() => ({
        getRequest: vi.fn(() => mockRequest),
        getResponse: vi.fn(() => mockResponse)
      })),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn()
    };
    httpAdapter = {
      getRequestUrl: vi.fn(),
      reply: vi.fn()
    };
    httpAdapterHost = {
      httpAdapter
    };
    exceptionHandler = new ExceptionHandler(httpAdapterHost as HttpAdapterHost<ExpressAdapter>);
  });

  describe('catch', () => {
    it('should correctly handle instances of HttpException', () => {
      exceptionHandler.catch(new NotFoundException(), argumentsHost);
      expect(httpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        {
          statusCode: HttpStatus.NOT_FOUND
        },
        HttpStatus.NOT_FOUND
      );
    });
  });
});
