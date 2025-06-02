import * as path from 'node:path';

import { defineUserConfig } from './src/user-config.js';

declare module './src/user-config.js' {
  export interface UserConfig extends InferUserConfig<typeof config> {}
}

const config = defineUserConfig({
  build: {
    outfile: path.resolve(import.meta.dirname, 'build/server.js')
  },
  entry: () => import('./example/app.js'),
  importPrismaClient: () => import('@prisma/generated-client')
});

export default config;
