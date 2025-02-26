import { isObject } from '@douglasneuroinformatics/libjs';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { ExpressAdapter } from '@nestjs/platform-express';
import type { Response } from 'express';

import { LoggingService } from '../modules/logging/logging.service.js';

export type ExceptionResponseBody = {
  [key: string]: unknown;
  message?: string;
  statusCode: number;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost<ExpressAdapter>,
    private readonly loggingService: LoggingService
  ) {}

  catch(exception: unknown, argumentsHost: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = argumentsHost.switchToHttp();
    const res = ctx.getResponse<Response>();

    const [body, statusCode] = this.parseException(exception);

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.loggingService.error(exception);
    }

    httpAdapter.reply(res, body, statusCode);
  }

  private parseException(exception: unknown): [ExceptionResponseBody, number] {
    let body: ExceptionResponseBody;
    if (exception instanceof HttpException) {
      body = this.parseHttpException(exception);
    } else {
      body = this.parseUnknownException();
    }
    return [body, body.statusCode];
  }

  private parseHttpException(exception: HttpException): ExceptionResponseBody {
    const response = exception.getResponse();
    const statusCode = exception.getStatus();
    if (isObject(response)) {
      return {
        ...response,
        statusCode
      };
    } else {
      return {
        message: response,
        statusCode
      };
    }
  }

  private parseUnknownException(): ExceptionResponseBody {
    return {
      message: 'Internal Server Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
  }
}
