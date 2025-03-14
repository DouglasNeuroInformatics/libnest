import { describe, expect, it, vi } from 'vitest';

import { accessibleQuery } from '../prisma.utils.js';

const accessibleBy = vi.hoisted(() => vi.fn());

vi.mock('@casl/prisma/runtime', () => ({
  createAccessibleByFactory: () => accessibleBy
}));

describe('accessibleQuery', () => {
  it('should return an empty object if ability is undefined', () => {
    expect(accessibleQuery(undefined, 'manage', 'Cat')).toStrictEqual({});
    expect(accessibleBy).not.toHaveBeenCalled();
  });
  it('should call accessibleBy with the correct parameters and return the result of accessibleBy for the model', () => {
    accessibleBy.mockReturnValueOnce({
      Cat: 'QUERY'
    });
    const ability = vi.fn();
    expect(accessibleQuery(ability as any, 'manage', 'Cat')).toStrictEqual('QUERY');
    expect(accessibleBy).toHaveBeenCalledExactlyOnceWith(ability, 'manage');
  });
});
