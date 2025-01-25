import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import type { PrismaModuleOptions } from './prisma.config.js';

export const PRISMA_CLIENT_TOKEN = 'PRISMA_CLIENT';

@Injectable()
export class PrismaFactory {
  static createClient(options: PrismaModuleOptions) {
    return new PrismaClient(options).$extends({
      model: {
        $allModels: {
          async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
            const context = Prisma.getExtensionContext(this);
            const result = await (context as PrismaClient[Lowercase<Prisma.ModelName>]).findFirst({ where });
            return result !== null;
          }
        }
      }
    });
  }
}
