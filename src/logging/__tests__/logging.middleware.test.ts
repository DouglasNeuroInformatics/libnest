import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { LoggingMiddleware } from '../logging.middleware.js';

const JSONLogger = vi.hoisted(() => {
  const constructor = vi.fn();
  constructor.prototype.error = vi.fn();
  constructor.prototype.log = vi.fn();
  return constructor as Mock & {
    prototype: {
      error: Mock;
      log: Mock;
    };
  };
});

vi.mock('../json.logger.ts', () => ({ JSONLogger }));

describe('LoggingMiddleware', () => {
  let loggingMiddleware: LoggingMiddleware;

  let request: Partial<{ [K in keyof Request]: Mock }>;
  let response: Partial<{ [K in keyof Response]: Mock } & { statusCode: any }>;
  let next: NextFunction;

  beforeEach(() => {
    loggingMiddleware = new LoggingMiddleware({});
    request = {};
    response = {
      on: vi.fn(),
      get statusCode() {
        return vi.fn();
      }
    };
    next = vi.fn();
  });

  describe('use', () => {
    it('should call the next function', () => {
      loggingMiddleware.use(request as any, response as any, next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('should register a listener for the finish event', () => {
      loggingMiddleware.use(request as any, response as any, next);
      expect(response.on).toHaveBeenCalledOnce();
      const [event, listener] = response.on!.mock.lastCall as [string, () => void];
      expect(event).toBe('finish');
      expect(listener).toBeTypeOf('function');
      expect(JSONLogger.prototype.log).not.toHaveBeenCalled();
      expect(JSONLogger.prototype.error).not.toHaveBeenCalled();
    });

    it('should log a 200 status code response', async () => {
      loggingMiddleware.use(request as any, response as any, next);
      const listener = response.on!.mock.lastCall![1] as () => void;
      vi.spyOn(response, 'statusCode', 'get').mockImplementation(() => 200);
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          listener();
          resolve();
        }, 10)
      );
      expect(JSONLogger.prototype.log).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          response: {
            statusCode: 200
          }
        })
      );
      expect(JSONLogger.prototype.error).not.toHaveBeenCalled();
    });

    it('should log a 500 status code response as an error', async () => {
      loggingMiddleware.use(request as any, response as any, next);
      const listener = response.on!.mock.lastCall![1] as () => void;
      response.statusCode.mockResolvedValueOnce(500);
      vi.spyOn(response, 'statusCode', 'get').mockImplementation(() => 500);
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          listener();
          resolve();
        }, 10)
      );
      expect(JSONLogger.prototype.error).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          response: {
            statusCode: 500
          }
        })
      );
    });
  });
});
