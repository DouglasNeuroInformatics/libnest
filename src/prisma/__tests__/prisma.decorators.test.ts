import { describe, expect, it, vi } from 'vitest';

import { InjectModel } from '../prisma.decorators.js';

import type { PrismaModelName } from '../../types.js';

const Inject = vi.hoisted(() => vi.fn(() => 'INJECTED'));
const getModelToken = vi.hoisted(() => vi.fn((modelName: PrismaModelName) => `MockToken_${modelName}`));

vi.mock('@nestjs/common', () => ({ Inject }));

vi.mock('../prisma.utils.js', () => ({ getModelToken }));

describe('InjectModel', () => {
  it('should call Inject with the correct model token', () => {
    const modelName = 'User';
    const model = InjectModel(modelName);
    expect(getModelToken).toHaveBeenCalledWith(modelName);
    expect(Inject).toHaveBeenCalledWith(`MockToken_${modelName}`);
    expect(model).toBe('INJECTED');
  });
});
