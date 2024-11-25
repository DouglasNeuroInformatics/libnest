import { Inject, Injectable } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { JSONLogger } from './json.logger.js';
import { LOGGING_MODULE_OPTIONS_TOKEN, type LoggingModuleOptions } from './logging.config.js';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: JSONLogger;

  constructor(@Inject(LOGGING_MODULE_OPTIONS_TOKEN) options: LoggingModuleOptions) {
    this.logger = new JSONLogger('HTTP', options);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const end = Date.now();
      this.logger[res.statusCode >= 500 ? 'error' : 'log']({
        duration: `${end - start}ms`,
        request: {
          method: req.method,
          path: req.path
        },
        response: {
          statusCode: res.statusCode,
          statusMessage: res.statusMessage
        }
      });
    });
    next();
  }
}
