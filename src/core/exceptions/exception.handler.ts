import { isObject, isObjectLike } from '@douglasneuroinformatics/libjs';
import { Catch, HttpException, HttpStatus, Inject, Optional } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter, HttpServer } from '@nestjs/common';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';
import { MESSAGES } from '@nestjs/core/constants.js';
import type { Simplify } from 'type-fest';

import { LoggingService } from '../../logging/logging.service.js';

type ErrorLike = {
  [key: string]: unknown;
  message: string;
  name: string;
  stack?: string;
};

type HttpErrorLike = Simplify<
  ErrorLike & {
    statusCode: number;
  }
>;

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  @Optional()
  @Inject()
  private readonly httpAdapterHost?: HttpAdapterHost;

  @Inject()
  private readonly loggingService: LoggingService;

  constructor(protected readonly applicationRef?: HttpServer) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    this.loggingService.log();
    const applicationRef = (this.applicationRef ?? this.httpAdapterHost?.httpAdapter)!;
    if (!(exception instanceof HttpException)) {
      return this.handleUnknownError(exception, host, applicationRef);
    }
    const res = exception.getResponse();
    const message = isObject(res)
      ? res
      : {
          message: res,
          statusCode: exception.getStatus()
        };
    const response: unknown = host.getArgByIndex(1);
    if (!applicationRef.isHeadersSent(response)) {
      applicationRef.reply(response, message, exception.getStatus());
    } else {
      applicationRef.end(response);
    }
  }

  handleUnknownError(exception: unknown, host: ArgumentsHost, applicationRef: AbstractHttpAdapter | HttpServer) {
    const body = this.isHttpErrorLike(exception)
      ? {
          message: exception.message,
          statusCode: exception.statusCode
        }
      : {
          message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        };
    const response: unknown = host.getArgByIndex(1);
    if (!applicationRef.isHeadersSent(response)) {
      applicationRef.reply(response, body, body.statusCode);
    } else {
      applicationRef.end(response);
    }
    this.loggingService.error(exception);
  }

  private isErrorLike(err: unknown): err is ErrorLike {
    if (!isObjectLike(err)) {
      return false;
    }
    const { message, name, stack } = err as { [key: string]: unknown };
    return (
      typeof message === 'string' &&
      typeof name === 'string' &&
      (typeof stack === 'undefined' || typeof stack === 'string')
    );
  }

  private isHttpErrorLike(err: unknown): err is HttpErrorLike {
    if (!this.isErrorLike(err)) {
      return false;
    }
    return typeof err.statusCode === 'number';
  }
}
