import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import type {
  Call,
  DynamicClientExtensionThis,
  ExtensionArgs,
  InternalArgs,
  MergeExtArgs
} from '@prisma/client/runtime/library';

import { ConfigService } from '../config/config.service.js';

const EXTENSION_ARGS = {
  model: {
    $allModels: {
      async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
        const context = Prisma.getExtensionContext(this) as unknown as {
          findFirst: (...args: unknown[]) => Promise<unknown>;
        };
        const result = await context.findFirst({ where });
        return result !== null;
      }
    }
  }
} satisfies ExtensionArgs;

type InferPrismaExtensionArgs<TArgs extends { [key: string]: unknown }> = MergeExtArgs<
  Prisma.TypeMap,
  {},
  InternalArgs<TArgs['result'], TArgs['model'], TArgs['query'], TArgs['client']>
>;

type InferExtendedClient<TArgs extends { [key: string]: unknown }> = DynamicClientExtensionThis<
  Call<
    Prisma.TypeMapCb,
    {
      extArgs: InferPrismaExtensionArgs<TArgs>;
    }
  >,
  Prisma.TypeMapCb,
  InferPrismaExtensionArgs<TArgs>,
  Prisma.PrismaClientOptions
>;

export type ExtendedPrismaClient = InferExtendedClient<typeof EXTENSION_ARGS>;

@Injectable()
export class PrismaFactory {
  constructor(private readonly configService: ConfigService) {}

  createClient(): ExtendedPrismaClient {
    const mongoUri = this.configService.get('MONGO_URI');
    const dbName = this.configService.get('NODE_ENV');
    const url = new URL(`${mongoUri.href}/data-capture-${dbName}`);
    const params = {
      directConnection: this.configService.get('MONGO_DIRECT_CONNECTION'),
      replicaSet: this.configService.get('MONGO_REPLICA_SET'),
      retryWrites: this.configService.get('MONGO_RETRY_WRITES'),
      w: this.configService.get('MONGO_WRITE_CONCERN')
    };
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.append(key, String(value));
      }
    }
    return new PrismaClient({ datasourceUrl: url.href }).$extends(EXTENSION_ARGS);
  }
}
