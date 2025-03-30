import { Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import type {
  Call,
  DefaultArgs,
  DynamicClientExtensionThis,
  ExtensionArgs,
  InternalArgs,
  MergeExtArgs
} from '@prisma/client/runtime/library';

import { MONGO_CONNECTION_TOKEN } from './prisma.config.js';
import { getModelKey } from './prisma.utils.js';

import type { DefaultPrismaGlobalOmitConfig } from './prisma.config.js';
import type {
  PrismaModelKey,
  PrismaModelName,
  RuntimePrismaClientOptions,
  RuntimePrismaGlobalOmitConfig
} from './prisma.types.js';

const MODEL_EXTENSION_ARGS = {
  $allModels: {
    async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
      const context = Prisma.getExtensionContext(this) as unknown as {
        findFirst: (...args: unknown[]) => Promise<unknown>;
      };
      const result = await context.findFirst({ where });
      return result !== null;
    }
  }
} satisfies ExtensionArgs['model'];

type ModelExtArgs = typeof MODEL_EXTENSION_ARGS;

type ResultExtArgs = {
  [K in PrismaModelName as PrismaModelKey<K>]: {
    __modelName: {
      compute: () => K;
    };
  };
};

type InferPrismaExtensionArgs<TArgs extends { [key: string]: unknown }> = MergeExtArgs<
  Prisma.TypeMap<DefaultArgs, RuntimePrismaGlobalOmitConfig>,
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
  constructor(@Inject(MONGO_CONNECTION_TOKEN) private readonly datasourceUrl: string) {}

  createClient({ omit }: { omit?: DefaultPrismaGlobalOmitConfig }): ExtendedPrismaClient {
    return new PrismaClient({
      datasourceUrl: this.datasourceUrl,
      omit: omit ?? {}
    }).$extends((client) => {
      const result = {} as ResultExtArgs;
      Object.keys(Prisma.ModelName).forEach((modelName) => {
        result[getModelKey(modelName)] = {
          __modelName: {
            compute: (): string => modelName
          }
        };
      });
      return client.$extends({ model: MODEL_EXTENSION_ARGS, result });
    });
  }
}
