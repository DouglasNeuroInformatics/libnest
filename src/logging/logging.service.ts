import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

import { JSONLogger } from './json.logger.js';
import { LOGGING_MODULE_OPTIONS_TOKEN, type LoggingModuleOptions } from './logging.config.js';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService extends JSONLogger {
  constructor(
    @Inject(INQUIRER) parentClass: object,
    @Inject(LOGGING_MODULE_OPTIONS_TOKEN) options: LoggingModuleOptions
  ) {
    super(parentClass?.constructor?.name, options);
  }
}
