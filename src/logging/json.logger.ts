import type { LoggerService, LogLevel } from '@nestjs/common';
import chalk from 'chalk';
import { type ColorName } from 'chalk';

import type { LoggingModuleOptions } from './logging.config.js';

const LOG_COLORS: { [K in LogLevel]: ColorName } = {
  debug: 'green',
  error: 'red',
  fatal: 'red',
  log: 'green',
  verbose: 'gray',
  warn: 'yellow'
};

export class JSONLogger implements LoggerService {
  private readonly dateFormatter = new Intl.DateTimeFormat('en-CA', {
    day: 'numeric',
    hour: 'numeric',
    hour12: false,
    minute: 'numeric',
    month: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    year: 'numeric'
  });

  constructor(
    private readonly context: null | string,
    private options: LoggingModuleOptions
  ) {}

  debug(message: unknown) {
    if (this.options.debug) {
      this.write(message, { file: 'stdout', level: 'debug' });
    }
  }

  error(message: unknown) {
    this.write(message, { file: 'stderr', level: 'error' });
  }

  fatal(message: unknown) {
    this.write(message, { file: 'stderr', level: 'fatal' });
  }

  log(message: unknown) {
    this.write(message, { file: 'stdout', level: 'log' });
  }

  setOptions(options: LoggingModuleOptions) {
    this.options = options;
  }

  verbose(message: unknown) {
    if (this.options.verbose) {
      this.write(message, { file: 'stdout', level: 'verbose' });
    }
  }

  warn(message: unknown) {
    this.write(message, { file: 'stderr', level: 'warn' });
  }

  private write(
    message: unknown,
    options: {
      file: 'stderr' | 'stdout';
      level: LogLevel;
    }
  ) {
    const output = {
      context: this.context,
      date: this.dateFormatter.format(new Date()),
      level: options.level.toUpperCase(),
      message
    };
    process[options.file].write(chalk[LOG_COLORS[options.level]](JSON.stringify(output, null, 2)));
    process[options.file].write('\n');
  }
}
