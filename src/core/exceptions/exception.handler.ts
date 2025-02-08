import { Catch } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { ExpressAdapter } from '@nestjs/platform-express';
import type { Response } from 'express';

import { ExceptionResponseFactory } from './exception-response.factory.js';

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  private readonly exceptionResponseFactory = new ExceptionResponseFactory();

  constructor(private readonly httpAdapterHost: HttpAdapterHost<ExpressAdapter>) {}

  catch(exception: unknown, argumentsHost: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = argumentsHost.switchToHttp();
    const res = ctx.getResponse<Response>();

    const [body, statusCode] = this.exceptionResponseFactory.forException(exception);

    httpAdapter.reply(res, body, statusCode);
  }
}
