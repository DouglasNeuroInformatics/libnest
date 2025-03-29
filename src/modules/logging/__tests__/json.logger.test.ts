import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { InternalServerErrorException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { JSONLogger } from '../json.logger.js';

vi.mock('chalk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('chalk')>()),
  gray: vi.fn((text) => text),
  green: vi.fn((text) => text),
  red: vi.fn((text) => text),
  yellow: vi.fn((text) => text)
}));

const expectedLogContext = {
  context: 'TestContext',
  date: expect.any(String)
};

describe('JSONLogger', () => {
  let logger: JSONLogger;
  let stdoutSpy: MockInstance<(...args: any[]) => any>;
  let stderrSpy: MockInstance<(...args: any[]) => any>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      logger = new JSONLogger('TestContext', { debug: true, log: true, verbose: true, warn: true });
    });

    it('should log a debug message to stdout if enabled', () => {
      logger.debug('Debug');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        level: 'DEBUG',
        message: 'Debug'
      });
    });

    it('should log an error message to stderr', () => {
      logger.error('Error');
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        level: 'ERROR',
        message: 'Error'
      });
    });

    it('should log an error object correctly', () => {
      const error = new Error('Something went wrong');
      logger.error(error);
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        error: {
          message: 'Something went wrong',
          name: 'Error',
          stack: expect.any(Array)
        },
        level: 'ERROR'
      });
    });

    it('should log an HttpException correctly', () => {
      const error = new InternalServerErrorException('Something went wrong');
      logger.error(error);
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        error: {
          message: 'Something went wrong',
          name: 'InternalServerErrorException',
          stack: expect.any(Array)
        },
        level: 'ERROR'
      });
    });

    it('should log error causes correctly', () => {
      const e3 = new RuntimeException('Error 2', {
        details: {
          foo: null
        }
      });
      const e2: any = new Error('Error 2', {
        cause: e3
      });
      e2.code = 'ERROR_CODE';
      const e1 = new Error('Error 1', {
        cause: e2
      });
      logger.error(e1);
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        error: {
          cause: {
            cause: {
              details: {
                foo: null
              },
              message: 'Error 2',
              name: 'RuntimeException'
            },
            code: 'ERROR_CODE',
            message: 'Error 2',
            name: 'Error'
          },
          message: 'Error 1',
          name: 'Error',
          stack: expect.any(Array)
        },
        level: 'ERROR'
      });
    });

    it('should log a fatal error to stderr', () => {
      logger.fatal('Fatal');
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        level: 'FATAL',
        message: 'Fatal'
      });
    });

    it('should write a log message to stdout', () => {
      logger.log('Log');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        level: 'LOG',
        message: 'Log'
      });
    });

    it('should log an object', () => {
      logger.log({ greeting: 'Hello' });
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        greeting: 'Hello',
        level: 'LOG'
      });
    });

    it('should log a verbose message to stdout', () => {
      logger.verbose('Verbose');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        level: 'VERBOSE',
        message: 'Verbose'
      });
    });

    it('should log a warning to stderr', () => {
      logger.warn('Warning message');
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toStrictEqual({
        ...expectedLogContext,
        level: 'WARN',
        message: 'Warning message'
      });
    });
  });

  describe('Configuration Handling', () => {
    it('should not log debug messages if debug is disabled', () => {
      logger = new JSONLogger('TestContext', { debug: false });
      logger.debug('This should not be logged');
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it('should not log verbose messages if verbose is disabled', () => {
      logger = new JSONLogger('TestContext', { verbose: false });
      logger.verbose('This should not be logged');
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it('should not log log messages if log is disabled', () => {
      logger = new JSONLogger('TestContext', { log: false });
      logger.log('This should not be logged');
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it('should not log warnings if warn is disabled', () => {
      logger = new JSONLogger('TestContext', { warn: false });
      logger.warn('This should not be logged');
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe('Context Handling', () => {
    it('should include context in log output', () => {
      logger = new JSONLogger('TestContext');
      logger.log('Test message');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toMatchObject({
        context: 'TestContext'
      });
    });

    it('should override default context if provided', () => {
      logger = new JSONLogger('TestContext');
      logger.log('Test message', 'NewContext');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toMatchObject({
        context: 'NewContext'
      });
    });

    it('should handle logs without a context', () => {
      logger = new JSONLogger();
      logger.log('Test message');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toStrictEqual({
        date: expect.any(String),
        level: 'LOG',
        message: 'Test message'
      });
    });
  });
});
