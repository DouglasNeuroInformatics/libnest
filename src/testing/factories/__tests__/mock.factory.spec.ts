import { describe, expect, it } from 'vitest';

import { MockFactory } from '../mock.factory.js';

class Animal {
  eat() {
    return;
  }
}

class Cat extends Animal {
  meow() {
    return;
  }
}

describe('MockFactory', () => {
  describe('createForModelToken', () => {
    it('should provide the correct token', () => {
      expect(MockFactory.createForModelToken('TOKEN')).toMatchObject({
        provide: 'TOKEN'
      });
    });
  });
  describe('createForService', () => {
    it('should provide the correct token and mock all functions', () => {
      expect(MockFactory.createForService(Cat)).toMatchObject({
        provide: Cat,
        useValue: {
          eat: expect.any(Function),
          meow: expect.any(Function)
        }
      });
    });
  });
});
