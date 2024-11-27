/* eslint-disable no-dupe-class-members */
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

  public fatal: LoggerMethod = (...args) => {
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    this.printMessages(messages, { context, file: 'stderr', level: 'fatal' });
  };

  public log: LoggerMethod = (...args) => {
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

  constructor(
    private readonly context: null | string,
    private readonly options: LoggingModuleOptions
  ) {}

  error(message: unknown, stackOrContext?: string): void;
  error(message: unknown, stack?: string, context?: string): void;
  error(message: unknown, ...optionalParams: [...any, string?, string?]): void;

  error(message: unknown, ...optionalParams: unknown[]) {
    const { context, messages, stack } = this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
    this.printMessages(messages, { context, file: 'stderr', level: 'error' });
    this.printStackTrace(stack);
  }

  private getContextAndMessagesToPrint(args: unknown[]) {
    if (args?.length <= 1) {
      return { context: this.context, messages: args };
    }
    const lastElement = args[args.length - 1];
    const isContext = typeof lastElement === 'string';
    if (!isContext) {
      return { context: this.context, messages: args };
    }
    return {
      context: lastElement,
      messages: args.slice(0, args.length - 1)
    };
  }

  private getContextAndStackAndMessagesToPrint(args: unknown[]) {
    if (args.length === 2) {
      return this.isStackFormat(args[1])
        ? {
            context: this.context,
            messages: [args[0]],
            stack: args[1] as string
          }
        : {
            context: args[1] as string,
            messages: [args[0]]
          };
    }
    const { context, messages } = this.getContextAndMessagesToPrint(args);
    if (messages?.length <= 1) {
      return { context, messages };
    }
    const lastElement = messages[messages.length - 1];
    const isStack = typeof lastElement === 'string';
    if (!isStack) {
      return { context, messages };
    }
    return {
      context,
      messages: messages.slice(0, messages.length - 1),
      stack: lastElement
    };
  }

  private isStackFormat(stack: unknown) {
    if (typeof stack !== 'string') {
      return false;
    }
    return /^(.)+\n\s+at .+:\d+:\d+/.test(stack);
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
        message
      };
      if (options.context) {
        output.context = options.context;
      }
      process[options.file].write(chalk[LOG_COLORS[options.level]](JSON.stringify(output, null, 2)));
      process[options.file].write('\n');
    });
  }

  private printStackTrace(stack?: string) {
    if (!stack) {
      return;
    }
    process.stderr.write(`${stack}\n`);
  }
}
