import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import type { HttpAdapterHost } from '@nestjs/core';
import type { ExpressAdapter } from '@nestjs/platform-express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { LoggingService } from '../../../logging/logging.service.js';
import { type MockedInstance, MockFactory } from '../../../testing/index.js';
import { GlobalExceptionFilter } from '../global-exception.filter.js';

import type { ExceptionResponseBody } from '../global-exception.filter.js';

describe('GlobalExceptionFilter', () => {
  let globalExceptionFilter: GlobalExceptionFilter;

  let argumentsHost: MockedInstance<ArgumentsHost>;
  let httpAdapter: Partial<MockedInstance<ExpressAdapter>>;
  let httpAdapterHost: MockedInstance<HttpAdapterHost<ExpressAdapter>>;
  let mockRequest: Mock;
  let mockResponse: Mock;
  let loggingService: MockedInstance<LoggingService>;

  const createExpectedReply = (body: ExceptionResponseBody) => {
    return [expect.anything(), body, body.statusCode];
  };

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
    loggingService = MockFactory.createMock(LoggingService);
    globalExceptionFilter = new GlobalExceptionFilter(httpAdapterHost as any, loggingService as any);
  });

  describe('catch', () => {
    it('should correctly handle a NotFoundException', () => {
      globalExceptionFilter.catch(new NotFoundException(), argumentsHost);
      expect(httpAdapter.reply).toHaveBeenLastCalledWith(
        ...createExpectedReply({
          message: 'Not Found',
          statusCode: HttpStatus.NOT_FOUND
        })
      );
      expect(loggingService.error).not.toHaveBeenCalled();
    });
    it('should correctly handle an InternalServerErrorException with a custom message and description', () => {
      const exception = new InternalServerErrorException('Uh oh...');
      globalExceptionFilter.catch(exception, argumentsHost);
      expect(httpAdapter.reply).toHaveBeenLastCalledWith(
        ...createExpectedReply({
          error: 'Internal Server Error',
          message: 'Uh oh...',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
      expect(loggingService.error).toHaveBeenLastCalledWith(exception);
    });
    it('should correctly handle an InternalServerErrorException with a custom response', () => {
      globalExceptionFilter.catch(
        new InternalServerErrorException({
          problem: 'Uh oh...'
        }),
        argumentsHost
      );
      expect(httpAdapter.reply).toHaveBeenLastCalledWith(
        ...createExpectedReply({
          problem: 'Uh oh...',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
    it('should correctly handle an HttpException with a string message', () => {
      const exception = new HttpException('Internal Error', HttpStatus.INTERNAL_SERVER_ERROR);
      globalExceptionFilter.catch(exception, argumentsHost);
      expect(httpAdapter.reply).toHaveBeenLastCalledWith(
        ...createExpectedReply({
          message: 'Internal Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
      expect(loggingService.error).toHaveBeenLastCalledWith(exception);
    });
    it('should correctly handle an HttpException where a conflicting status code is defined in the response', () => {
      globalExceptionFilter.catch(
        new HttpException(
          {
            statusCode: HttpStatus.OK
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        ),
        argumentsHost
      );
      expect(httpAdapter.reply).toHaveBeenLastCalledWith(
        ...createExpectedReply({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
    it('should correctly handle an generic Error', () => {
      globalExceptionFilter.catch(new Error('This should not be sent to the user'), argumentsHost);
      expect(httpAdapter.reply).toHaveBeenLastCalledWith(
        ...createExpectedReply({
          message: 'Internal Server Error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });
});
