// import { Module } from '@nestjs/common';
// import type { NestExpressApplication } from '@nestjs/platform-express';
// import { Test, TestingModule } from '@nestjs/testing';
// import { PrismaClient } from '@prisma/client';
// import request from 'supertest';
// import type { Class } from 'type-fest';
// import { expect, suite } from 'vitest';
// import type { ExpectStatic, TestAPI } from 'vitest';

// import { configureApp } from '../../app/app.utils.js';

// import type { ImportedModule } from '../../app/app.base.js';
// import type { TestAgent } from './types.js';

// type IntegrationTestFactory = (ctx: { api: TestAgent; expect: ExpectStatic; it: TestAPI; test: TestAPI }) => void;

// @Module({})
// export class IntegrationTestModule {
//   static async for(module: ImportedModule): Promise<TestingModule> {
//     const { AppFactory } = await import('../../app/app.factory.js');
//     return Test.createTestingModule({
//       imports: [
//         AppFactory.createModule({
//           envConfig: {
//             API_PORT: null!,
//             MONGO_URI: null!,
//             NODE_ENV: 'test',
//             SECRET_KEY: '12345',
//             THROTTLER_ENABLED: false
//           },
//           imports: [module],
//           prisma: {
//             client: {
//               constructor: PrismaClient
//             },
//             dbPrefix: null,
//             useInMemoryDbForTesting: true
//           }
//         })
//       ]
//     }).compile();
//   }
// }

// export function integrationTestSuite(module: Class<any>, fn: IntegrationTestFactory): void {
//   let app: NestExpressApplication;
//   const api = {} as TestAgent;

//   const collector = suite(module.name, (test) => fn({ api, expect, it: test, test }));

//   collector.on('beforeAll', async () => {
//     const moduleRef = await IntegrationTestModule.for(module);
//     app = moduleRef.createNestApplication({
//       logger: false
//     });
//     await configureApp(app);
//     await app.init();
//     const agent = request.agent(app.getHttpServer());
//     Object.setPrototypeOf(api, agent);
//   });

//   collector.on('afterAll', async () => {
//     if (app) {
//       await app.close();
//       app.flushLogs();
//     }
//   });
// }
