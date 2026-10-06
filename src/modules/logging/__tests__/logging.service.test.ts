import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { LOGGING_MODULE_OPTIONS_TOKEN } from '../logging.config.js';
import { LoggingService } from '../logging.service.js';

import type { LoggingOptions } from '../logging.config.js';

const JSONLogger = vi.hoisted(() => vi.fn());

vi.mock('../json.logger.ts', () => ({ JSONLogger }));

@Injectable()
class TestParent {
  constructor(readonly loggingService: LoggingService) {}
}

describe('LoggingService', () => {
  const resolveLoggingService = async (providers: { provide: string; useValue: LoggingOptions }[] = []) => {
    const moduleRef = await Test.createTestingModule({
      providers: [LoggingService, TestParent, ...providers]
    }).compile();
    return moduleRef.get(TestParent).loggingService;
  };

  it('should extend JSONLogger', async () => {
    await expect(resolveLoggingService()).resolves.toBeInstanceOf(JSONLogger);
  });

  it('should call the JSONLogger constructor with the name of the class it is injected into and the options', async () => {
    const options: LoggingOptions = { debug: false, log: true, verbose: true };
    await resolveLoggingService([{ provide: LOGGING_MODULE_OPTIONS_TOKEN, useValue: options }]);
    expect(JSONLogger).toHaveBeenCalledWith('TestParent', options);
  });

  it('should resolve without logging options, so JSONLogger falls back to its defaults', async () => {
    await resolveLoggingService();
    expect(JSONLogger).toHaveBeenCalledWith('TestParent', undefined);
  });
});
