import { INQUIRER } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LOGGING_OPTIONS_TOKEN, type LoggingOptions } from '../logging.config.js';
import { LoggingService } from '../logging.service.js';

const JSONLogger = vi.hoisted(() => vi.fn());

vi.mock('../json.logger.ts', () => ({ JSONLogger }));

describe('LoggingService', () => {
  let loggingService: LoggingService;
  let mockOptions: LoggingOptions;
  let mockParentClass: object;

  beforeEach(async () => {
    mockOptions = {
      debug: false,
      log: true,
      verbose: true
    };
    mockParentClass = { constructor: { name: 'TestParent' } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        { provide: INQUIRER, useValue: mockParentClass },
        { provide: LOGGING_OPTIONS_TOKEN, useValue: mockOptions }
      ]
    }).compile();

    loggingService = await module.resolve<LoggingService>(LoggingService);
  });

  it('should be defined', () => {
    expect(loggingService).toBeDefined();
  });

  it('should extend JSONLogger', () => {
    expect(loggingService).toBeInstanceOf(JSONLogger);
  });

  it('should call the JSONLogger constructor with correct parameters', () => {
    expect(JSONLogger).toHaveBeenCalledWith('TestParent', mockOptions);
  });
});
