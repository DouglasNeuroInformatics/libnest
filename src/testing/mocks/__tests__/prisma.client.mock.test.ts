import { describe, expect, it } from 'vitest';

import { MockPrismaClient } from '../prisma.client.mock.js';

describe('MockPrismaClient', () => {
  const prismaClient = new MockPrismaClient({ modelNames: ['User'] });

  it('should allow accessing base properties on the prototype', () => {
    const props = ['$connect', '$disconnect', '$runCommandRaw'] as const;
    for (const prop of props) {
      prismaClient[prop].mockReturnValue('__RETURN__');
      expect(prismaClient[prop]()).toBe('__RETURN__');
    }
  });

  it('should allow accessing defined models', () => {
    expect(prismaClient.user).toBeDefined();
  });

  it('should return undefined for other properties', () => {
    expect(prismaClient.group).not.toBeDefined();
  });
});
