import type { Provider } from '@nestjs/common';
import type { Class } from 'type-fest';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

export type MockedInstance<T extends object> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: Mock;
};

export class MockFactory {
  /**
   * Create a mock Nest.js provider for a Prisma model (injecting a token), providing an object with all Prisma methods set to a mock function
   */
  static createForModelToken(token: string): Provider {
    return {
      provide: token,
      useValue: {
        aggregate: vi.fn(),
        aggregateRaw: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        exists: vi.fn(),
        fields: vi.fn(),
        findFirst: vi.fn(),
        findFirstOrThrow: vi.fn(),
        findMany: vi.fn(),
        findRaw: vi.fn(),
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        groupBy: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        upsert: vi.fn()
      }
    };
  }

  /**
   * Create a mock Nest.js provider for a class, with all own and inherited functions set to a mock function
   * @param constructor - the class to mock
   * @returns an object representing an instance of T with all own and inherited functions mocked
   */
  static createForService<T extends object>(constructor: Class<T>): Provider<MockedInstance<T>> {
    return {
      provide: constructor,
      useValue: this.createMock(constructor)
    };
  }

  /**
   * Recurse through the prototype chain and set all properties where the value is a function to a mock function
   * @param constructor - the class to mock
   * @returns an object representing an instance of T with all own and inherited functions mocked (excluding those of Object.prototype)
   */
  static createMock<T extends object>(constructor: Class<T>) {
    const prototype = constructor.prototype as { [key: string]: unknown };
    const obj: { [key: string]: unknown } = {};
    this.getAllPropertyNames(prototype)
      .filter((s) => s !== 'constructor')
      .forEach((prop) => {
        obj[prop] = vi.fn();
      });
    return obj as MockedInstance<T>;
  }

  /**
   * Recurse through the prototype chain of an object to get all property names, excluding those of Object.prototype
   * @param object - the object whose prototype chain to recurse through
   * @returns an array of string representing all own and inherited properties of the object
   */
  static getAllPropertyNames(object: object): string[] {
    const properties = Object.getOwnPropertyNames(object);
    const prototype: unknown = Object.getPrototypeOf(object);
    if (prototype === Object.prototype) {
      return properties;
    }
    return Array.from(new Set(properties.concat(this.getAllPropertyNames(prototype as object))));
  }
}
