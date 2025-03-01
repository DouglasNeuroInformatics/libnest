import type { Provider } from '@nestjs/common';
import type { Class } from 'type-fest';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

import { MockPrismaModel } from '../mocks/prisma.model.mock.js';

export type MockedInstance<T extends object> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: Mock;
};

/**
 * A utility class for creating mock providers and instances for testing.
 */
export class MockFactory {
  /**
   * Creates a mock provider for a Prisma model token.
   * @param token - The Prisma model token.
   * @returns A NestJS provider with mock Prisma methods.
   */
  static createForModelToken(token: string): Provider {
    return {
      provide: token,
      useValue: new MockPrismaModel()
    };
  }

  /**
   * Creates a mock provider for a service.
   * @param constructor - The service class.
   * @returns A NestJS provider with a mocked service instance.
   */
  static createForService<T extends object>(constructor: Class<T>): Provider<MockedInstance<T>> {
    return {
      provide: constructor,
      useValue: this.createMock(constructor)
    };
  }

  /**
   * Creates a mock instance of a class, mocking all its methods.
   * @param constructor - The class to mock.
   * @returns A mocked instance of the class.
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
   * Gets all property names of an object, including those from its prototype chain.
   * @param object - The object to get property names from.
   * @returns An array of property names.
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
