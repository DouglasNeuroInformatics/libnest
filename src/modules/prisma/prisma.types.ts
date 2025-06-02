import type { FallbackIfNever } from '@douglasneuroinformatics/libjs';

import type { UserConfig } from '../../user-config.js';
import type { PrismaModuleLike } from './prisma.base.js';

type RuntimePrismaModule = UserConfig extends {
  RuntimePrismaModule: infer TRuntimePrismaModule extends typeof PrismaModuleLike;
}
  ? TRuntimePrismaModule
  : typeof PrismaModuleLike;

type RuntimePrismaClient = InstanceType<RuntimePrismaModule['PrismaClient']> & {
  [key: string]: any;
};

export type PrismaModelName = FallbackIfNever<
  Extract<keyof RuntimePrismaModule['Prisma']['ModelName'], string>,
  string
>;

export type PrismaModelKey<T extends PrismaModelName = PrismaModelName> = Uncapitalize<T>;

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: RuntimePrismaClient[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};

// export type Model<T extends PrismaModelName> =
//   ExtendedPrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;

// export type RuntimePrismaGlobalOmitConfig = UserConfig extends {
//   PrismaGlobalOmitConfig: infer TPrismaGlobalOmitConfig extends DefaultPrismaGlobalOmitConfig;
// }
//   ? TPrismaGlobalOmitConfig
//   : DefaultPrismaGlobalOmitConfig;

// export type RuntimePrismaClientOptions = {
//   datasourceUrl: string;
//   omit: RuntimePrismaGlobalOmitConfig;
// };
