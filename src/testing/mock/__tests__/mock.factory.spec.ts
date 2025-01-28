import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConfigService } from '../../../config/config.service.js';
import { CryptoService } from '../../../crypto/crypto.service.js';
import { getModelToken } from '../../../prisma/prisma.utils.js';
import { type MockedInstance, MockFactory } from '../mock.factory.js';

class Animal {
  kingdom = 'Animalia';
  constructor(public age: number) {}
}

class Dog extends Animal {
  breed: string;
  name: string;

  constructor(name: string, age: number, breed: string) {
    super(age);
    this.breed = breed;
    this.name = name;
  }

  speak() {
    // eslint-disable-next-line no-console
    console.log('Woof!');
  }
}

describe('MockFactory', () => {
  describe('createForModel', () => {
    it('should provide the correct token', () => {
      expect(MockFactory.createForModel('User')).toMatchObject({
        provide: getModelToken('User')
      });
    });
  });
  describe('createForService', () => {
    let configService: MockedInstance<ConfigService>;
    let cryptoService: MockedInstance<CryptoService>;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [MockFactory.createForService(ConfigService), MockFactory.createForService(CryptoService)]
      }).compile();
      configService = moduleRef.get(ConfigService);
      cryptoService = moduleRef.get(CryptoService);
    });

    it('should successfully mock the ConfigService', () => {
      expect(configService).toMatchObject({
        get: expect.any(Function)
      });
    });

    it('should successfully mock the CryptoService', () => {
      expect(cryptoService).toMatchObject({
        comparePassword: expect.any(Function),
        hash: expect.any(Function),
        hashPassword: expect.any(Function)
      });
    });
  });
  describe('createMock', () => {
    it('should successfully mock all method', () => {
      const mock = MockFactory.createMock(Dog);
      expect(mock).toMatchObject({
        speak: expect.any(Function)
      });
    });
  });
});
