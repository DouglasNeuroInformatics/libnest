import type { LoggerService, LogLevel } from '@nestjs/common';
import chalk from 'chalk';
import { type ColorName } from 'chalk';
import { isErrorLike, serializeError } from 'serialize-error';

import type { LoggingModuleOptions } from './logging.config.js';

const LOG_COLORS: { [K in LogLevel]: ColorName } = {
  debug: 'green',
  error: 'red',
  fatal: 'red',
  log: 'green',
  verbose: 'gray',
  warn: 'yellow'
};

type LoggerMethod = {
  (message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  (message: unknown, context?: string): void;
};

export class JSONLogger implements LoggerService {
  public debug: LoggerMethod = (...args) => {
    if (!this.options.debug) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stdout', level: 'debug' });
  };

  public error: LoggerMethod = (...args) => {
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'error' });
  };

  public fatal: LoggerMethod = (...args) => {
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'fatal' });
  };

  public log: LoggerMethod = (...args) => {
    if (!this.options.log) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stdout', level: 'log' });
  };

  public verbose: LoggerMethod = (...args) => {
    if (!this.options.verbose) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stdout', level: 'verbose' });
  };

  public warn: LoggerMethod = (...args) => {
    if (!this.options.warn) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'warn' });
  };

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

  private readonly options: LoggingModuleOptions;

  constructor(
    private readonly context: null | string,
    options?: LoggingModuleOptions
  ) {
    this.options = {
      log: true,
      warn: true,
      ...options
    };
  }

  private getContextAndMessagesToPrint(args: unknown[]) {
    if (args.length <= 1 || typeof args.at(-1) !== 'string') {
      return { context: this.context, messages: args };
    }
    return {
      context: args.at(-1) as string,
      messages: args.slice(0, args.length - 1)
    };
  }

  private printMessages(
    messages: unknown[],
    options: {
      context: null | string;
      file: 'stderr' | 'stdout';
      level: LogLevel;
    }
  ) {
    messages.forEach((message) => {
      const output: { [key: string]: unknown } = {
        date: this.dateFormatter.format(new Date()),
        level: options.level.toUpperCase(),
        message: isErrorLike(message) ? serializeError(message) : message
      };
      if (options.context) {
        output.context = options.context;
      }
      process[options.file].write(chalk[LOG_COLORS[options.level]](JSON.stringify(output, null, 2)));
      process[options.file].write('\n');
    });
  }
}
