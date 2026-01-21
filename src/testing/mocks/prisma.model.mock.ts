import { vi } from 'vitest';

export class MockPrismaModel {
  aggregate = vi.fn<(...args: any[]) => any>();
  aggregateRaw = vi.fn<(...args: any[]) => any>();
  count = vi.fn<(...args: any[]) => any>();
  create = vi.fn<(...args: any[]) => any>();
  createMany = vi.fn<(...args: any[]) => any>();
  delete = vi.fn<(...args: any[]) => any>();
  deleteMany = vi.fn<(...args: any[]) => any>();
  exists = vi.fn<(...args: any[]) => any>();
  fields = vi.fn<(...args: any[]) => any>();
  findFirst = vi.fn<(...args: any[]) => any>();
  findFirstOrThrow = vi.fn<(...args: any[]) => any>();
  findMany = vi.fn<(...args: any[]) => any>();
  findRaw = vi.fn<(...args: any[]) => any>();
  findUnique = vi.fn<(...args: any[]) => any>();
  findUniqueOrThrow = vi.fn<(...args: any[]) => any>();
  groupBy = vi.fn<(...args: any[]) => any>();
  update = vi.fn<(...args: any[]) => any>();
  updateMany = vi.fn<(...args: any[]) => any>();
  upsert = vi.fn<(...args: any[]) => any>();
}
