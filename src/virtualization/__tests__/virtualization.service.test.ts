import { beforeEach, describe, expect, it } from 'vitest';

import { LoggingService } from '../../logging/logging.service.js';
import { type MockedInstance, MockFactory } from '../../testing/index.js';
import { VirtualizationService } from '../virtualization.service.js';

describe('VirtualizationService', () => {
  let loggingService: MockedInstance<LoggingService>;
  let virtualizationService: VirtualizationService;

  beforeEach(() => {
    loggingService = MockFactory.createMock(LoggingService);
    virtualizationService = new VirtualizationService(
      {
        context: {
          setTimeout
        }
      },
      loggingService as any
    );
  });

  describe('eval', () => {
    it('should return the value of an expression', async () => {
      const result = await virtualizationService.eval('2 + 2');
      expect(result.isOk() && result.value === 4).toBe(true);
    });
    it('should handle an async IIFE', async () => {
      const code = '(async () => new Promise((resolve) => setTimeout(() => resolve(true), 50)))();';
      const result = await virtualizationService.eval(code);
      expect(result.isOk() && result.value === true).toBe(true);
    });
    it('should handle attempting to access non-existant global properties', async () => {
      const code = "document.createElement('div');";
      const result = await virtualizationService.eval(code);
      expect(result.isErr() && result.error.name === 'ReferenceError').toBe(true);
    });
    it('should handle non-errors being thrown', async () => {
      const code = "(() => { throw 'error' })();";
      const result = await virtualizationService.eval(code);
      expect(result.isErr()).toBe(true);
    });
  });
});
