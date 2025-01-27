import { describe, expect, it } from 'vitest';

import { getModelToken } from '../../../prisma/prisma.utils.js';
import { MockFactory } from '../mock.factory.js';

describe('MockFactory', () => {
  describe('createForModel', () => {
    it('should provide the correct token', () => {
      expect(MockFactory.createForModel('User')).toMatchObject({
        provide: getModelToken('User')
      });
    });
  });
});
