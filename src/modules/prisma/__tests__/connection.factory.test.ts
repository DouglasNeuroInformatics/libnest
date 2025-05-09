import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { MockFactory } from '../../../testing/index.js';
import { ConfigService } from '../../config/config.service.js';
import { LoggingService } from '../../logging/logging.service.js';
import { ConnectionFactory } from '../connection.factory.js';
import { PRISMA_MODULE_OPTIONS_TOKEN } from '../prisma.config.js';

import type { MockedInstance } from '../../../testing/index.js';

describe('ConnectionFactory', () => {
  describe('with memory database', () => {
    let configService: MockedInstance<ConfigService>;
    let connectionFactory: ConnectionFactory;
    let MockMongoMemoryReplSet: {
      create: Mock;
    };
    let mockReplSet: {
      getUri: Mock;
    };
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        providers: [
          MockFactory.createForService(ConfigService),
          MockFactory.createForService(LoggingService),
          {
            provide: PRISMA_MODULE_OPTIONS_TOKEN,
            useValue: {
              useInMemoryDbForTesting: true
            }
          },
          ConnectionFactory
        ]
      }).compile();
      module.enableShutdownHooks();
      configService = module.get(ConfigService);
      connectionFactory = module.get(ConnectionFactory);
      configService.get.mockImplementation((key) => {
        if (key === 'NODE_ENV') {
          return 'test';
        }
        throw new Error(`Unexpected key: ${key}`);
      });
      mockReplSet = {
        getUri: vi.fn().mockReturnValue('mongodb://localhost:27017')
      };
      MockMongoMemoryReplSet = {
        create: vi.fn().mockImplementation(() => mockReplSet)
      };
      vi.doMock('mongodb-memory-server', () => ({ MongoMemoryReplSet: MockMongoMemoryReplSet }));
    });

    it('should initialize a repl set and stop it when the application is shutdown', async () => {
      await connectionFactory.create();
      expect(MockMongoMemoryReplSet.create).toHaveBeenCalledOnce();
      await module.init();
      await module.close();
    });
  });
});
