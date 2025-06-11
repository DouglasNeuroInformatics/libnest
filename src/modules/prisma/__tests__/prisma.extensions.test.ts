import { Prisma } from '@prisma/client';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

describe('LibnestPrismaExtension', () => {
  let defineExtensionMock: MockInstance;
  let getExtensionContextMock: MockInstance;
  let extensionFactory: (client: any) => any;

  beforeAll(async () => {
    defineExtensionMock = vi.spyOn(Prisma, 'defineExtension').mockImplementation((arg) => arg as any);
    getExtensionContextMock = vi.spyOn(Prisma, 'getExtensionContext');
    vi.spyOn(Prisma, 'ModelName', 'get').mockReturnValueOnce({
      Dog: 'Dog'
    });
    await import('../prisma.extensions.js');
  });

  it('should define the extension', () => {
    expect(defineExtensionMock).toHaveBeenCalledOnce();
    const extensionArg = defineExtensionMock.mock.lastCall?.[0];
    expect(extensionArg).toBeTypeOf('function');
    extensionFactory = extensionArg;
  });

  it('should correctly extend the PrismaClient', async () => {
    const mockClient = {
      $extends: vi.fn().mockImplementation((arg) => arg)
    };
    const extension = extensionFactory(mockClient);
    expect(extension).toStrictEqual({
      model: {
        $allModels: {
          exists: expect.any(Function)
        }
      },
      name: 'libnest',
      result: {
        dog: {
          __modelName: {
            compute: expect.any(Function)
          }
        }
      }
    });

    const exists = extension.model.$allModels.exists;
    getExtensionContextMock.mockReturnValueOnce({
      findFirst: () => null
    });
    await expect(exists.call({}, { id: '123' })).resolves.toBe(false);

    getExtensionContextMock.mockReturnValueOnce({
      findFirst: () => ({ id: '123' })
    });
    await expect(exists.call({}, { id: '123' })).resolves.toBe(true);

    const computedModelName = extension.result.dog.__modelName.compute;
    expect(computedModelName()).toBe('Dog');
  });
});
