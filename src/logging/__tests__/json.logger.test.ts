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
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toMatchObject({
        level: 'DEBUG',
        message: 'Debug'
      });
    });

    it('should log an error message to stderr', () => {
      logger.error('Error');
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toMatchObject({
        level: 'ERROR',
        message: 'Error'
      });
    });

    it('should log an error object correctly', () => {
      const error = new Error('Something went wrong');
      logger.error(error);
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toMatchObject({
        error: {
          message: 'Something went wrong'
        },
        level: 'ERROR'
      });
    });

    it('should log a fatal error to stderr', () => {
      logger.fatal('Fatal');
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toMatchObject({
        level: 'FATAL',
        message: 'Fatal'
      });
    });

    it('should write a log message to stdout', () => {
      logger.log('Log');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toMatchObject({
        level: 'LOG',
        message: 'Log'
      });
    });

    it('should log an object', () => {
      logger.log({ greeting: 'Hello' });
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toMatchObject({
        greeting: 'Hello',
        level: 'LOG'
      });
    });

    it('should log a verbose message to stdout', () => {
      logger.verbose('Verbose');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toMatchObject({
        level: 'VERBOSE'
      });
    });

    it('should log a warning to stderr', () => {
      logger.warn('Warning message');
      expect(JSON.parse(stderrSpy.mock.lastCall![0])).toMatchObject({
        level: 'WARN'
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
      logger = new JSONLogger(null);
      logger.log('Test message');
      expect(JSON.parse(stdoutSpy.mock.lastCall![0])).toStrictEqual({
        date: expect.any(String),
        level: 'LOG',
        message: 'Test message'
      });
    });
  });
});
