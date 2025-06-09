import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import type {
  Call,
  DefaultArgs,
  DynamicClientExtensionThis,
  InternalArgs,
  MergeExtArgs
} from '@prisma/client/runtime/library';

import { MONGO_CONNECTION_TOKEN } from './prisma.config.js';
import { LibnestPrismaExtension } from './prisma.extensions.js';

import type { MongoConnection } from './connection.factory.js';
import type { DefaultPrismaClientOptions } from './prisma.config.js';
import type { ModelExtArgs, ResultExtArgs } from './prisma.extensions.js';
import type { RuntimePrismaClientOptions } from './prisma.types.js';

type InferPrismaExtensionArgs<TArgs extends { [key: string]: unknown }> = MergeExtArgs<
  Prisma.TypeMap<DefaultArgs, RuntimePrismaClientOptions['omit']>,
  {},
  InternalArgs<TArgs['result'], TArgs['model'], TArgs['query'], TArgs['client']>
>;

type InferExtendedClient<TArgs extends { [key: string]: unknown }> = DynamicClientExtensionThis<
  Call<
    Prisma.TypeMapCb<RuntimePrismaClientOptions>,
    {
      extArgs: InferPrismaExtensionArgs<TArgs>;
    }
  >,
  Prisma.TypeMapCb<RuntimePrismaClientOptions>,
  InferPrismaExtensionArgs<TArgs>
>;

export type ExtendedPrismaClient = InferExtendedClient<{ model: ModelExtArgs; result: ResultExtArgs }>;

@Injectable()
export class PrismaFactory {
  constructor(@Inject(MONGO_CONNECTION_TOKEN) private readonly mongoConnection: MongoConnection) {}

  createClient(clientOptions: DefaultPrismaClientOptions): ExtendedPrismaClient {
    const options: Prisma.PrismaClientOptions = { ...clientOptions, datasourceUrl: this.mongoConnection.url.href };
    return new PrismaClient(options).$extends(LibnestPrismaExtension);
  }
}
