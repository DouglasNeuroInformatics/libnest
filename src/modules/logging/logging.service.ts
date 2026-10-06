import { Inject, Injectable, Optional, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

import { JSONLogger } from './json.logger.js';
import { LOGGING_MODULE_OPTIONS_TOKEN } from './logging.config.js';

import type { LoggingOptions } from './logging.config.js';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService extends JSONLogger {
  constructor(
    @Inject(INQUIRER) parentClass: object,
    @Inject(LOGGING_MODULE_OPTIONS_TOKEN) @Optional() options?: LoggingOptions
  ) {
    super(parentClass?.constructor?.name, options);
  }
}
