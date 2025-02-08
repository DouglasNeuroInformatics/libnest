import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost<ExpressAdapter>) {}

  catch(exception: unknown, argumentsHost: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = argumentsHost.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let httpStatus: HttpStatus;
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const responseBody = {
      path: httpAdapter.getRequestUrl(req),
      statusCode: httpStatus,
      timestamp: new Date().toISOString()
    };

    httpAdapter.reply(res, responseBody, httpStatus);
  }
}
