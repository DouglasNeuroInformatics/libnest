import { Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { ImportedModule } from '../../app/app.base.js';

@Module({})
export class IntegrationTestModule {
  static async for(module: ImportedModule): Promise<TestingModule> {
    const { AppFactory } = await import('../../app/app.factory.js');
    return Test.createTestingModule({
      imports: [
        AppFactory.createModule({
          envConfig: {
            API_PORT: null!,
            MONGO_URI: null!,
            NODE_ENV: 'test',
            SECRET_KEY: '12345',
            THROTTLER_ENABLED: false
          },
          imports: [module],
          prisma: {
            dbPrefix: null,
            useInMemoryDbForTesting: true
          }
        })
      ]
    }).compile();
  }
}
