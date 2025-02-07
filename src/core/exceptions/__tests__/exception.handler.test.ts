import type { ArgumentsHost, HttpServer } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggingService } from '../../../logging/logging.service.js';
import { MockFactory } from '../../../testing/index.js';
import { ExceptionHandler } from '../exception.handler.js';

import type { MockedInstance } from '../../../testing/index.js';

describe('ExceptionHandler', () => {
  let exceptionHandler: ExceptionHandler;

  let applicationRef: MockedInstance<HttpServer>;
  let argumentsHost: MockedInstance<ArgumentsHost>;
  let loggingService: MockedInstance<LoggingService>;

  beforeEach(() => {
    applicationRef = {
      end: vi.fn(),
      isHeadersSent: vi.fn(),
      reply: vi.fn()
    } satisfies MockedInstance<Partial<HttpServer>> as MockedInstance<HttpServer>;
    argumentsHost = {
      getArgByIndex: vi.fn()
    } satisfies MockedInstance<Partial<ArgumentsHost>> as MockedInstance<ArgumentsHost>;
    loggingService = MockFactory.createMock(LoggingService);
    exceptionHandler = new ExceptionHandler(applicationRef);
    Object.defineProperty(exceptionHandler, 'loggingService', {
      value: loggingService
    });
  });

  describe('catch', () => {
    it('should handle http-like unknown errors correctly', () => {
      const exception: any = new Error('Unknown Error');
      exception.statusCode = 400;
      applicationRef.isHeadersSent.mockReturnValueOnce(false);
      argumentsHost.getArgByIndex.mockReturnValueOnce('RESPONSE');
      exceptionHandler.catch(exception, argumentsHost);
      expect(applicationRef.reply).toHaveBeenLastCalledWith(
        'RESPONSE',
        {
          message: exception.message,
          statusCode: exception.statusCode
        },
        exception.statusCode
      );
    });
  });
});
