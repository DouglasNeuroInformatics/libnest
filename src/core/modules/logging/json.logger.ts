/* eslint-disable perfectionist/sort-classes */
/* eslint-disable no-dupe-class-members */

import { isPlainObject } from '@douglasneuroinformatics/libjs';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type { LoggerService, LogLevel } from '@nestjs/common';
import chalk from 'chalk';
import type { ColorName } from 'chalk';
import { isErrorLike, serializeError } from 'serialize-error';

import { LOGGING_OPTIONS_TOKEN } from './logging.config.js';

import type { LoggingOptions } from './logging.config.js';

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

type JSONLoggerType = {
  debug: LoggerMethod;
  error: LoggerMethod;
  fatal: LoggerMethod;
  verbose: LoggerMethod;
  warn: LoggerMethod;
};

@Injectable()
export class JSONLogger implements JSONLoggerType, LoggerService {
  debug(message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  debug(message: unknown, context?: string): void;
  debug(...args: unknown[]): void {
    if (!this.options.debug) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stdout', level: 'debug' });
  }

  error(message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  error(message: unknown, context?: string): void;
  error(...args: unknown[]) {
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'error' });
  }

  fatal(message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  fatal(message: unknown, context?: string): void;
  fatal(...args: unknown[]) {
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'fatal' });
  }

  log(message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  log(message: unknown, context?: string): void;
  log(...args: unknown[]) {
    if (!this.options.log) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stdout', level: 'log' });
  }

  verbose(message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  verbose(message: unknown, context?: string): void;
  verbose(...args: unknown[]) {
    if (!this.options.verbose) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stdout', level: 'verbose' });
  }

  warn(message: unknown, ...args: [...additionalMessages: any, context?: string]): void;
  warn(message: unknown, context?: string): void;
  warn(...args: unknown[]) {
    if (!this.options.warn) {
      return;
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'warn' });
  }

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

  private readonly options: LoggingOptions;

  constructor(
    @Optional()
    private readonly context?: string,
    @Inject(LOGGING_OPTIONS_TOKEN) @Optional() options?: LoggingOptions
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
      context?: string;
      file: 'stderr' | 'stdout';
      level: LogLevel;
    }
  ) {
    messages.forEach((message) => {
      const output: { [key: string]: unknown } = {};
      if (isErrorLike(message)) {
        output.error = serializeError(message);
      } else if (isPlainObject(message)) {
        Object.assign(output, message);
      } else {
        output.message = message;
      }
      output.date = this.dateFormatter.format(new Date());
      output.level = options.level.toUpperCase();
      if (options.context) {
        output.context = options.context;
      }
      const format = chalk[LOG_COLORS[options.level]];
      const content = format(JSON.stringify(output, null, 2) + '\n');
      process[options.file].write(content);
    });
  }
}
