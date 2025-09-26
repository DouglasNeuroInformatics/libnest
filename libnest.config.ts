import * as path from 'node:path';

import { defineUserConfig } from './src/user-config.js';

declare module './src/user-config.js' {
  export interface UserConfig {}
}

const config = defineUserConfig({
  build: {
    outfile: path.resolve(import.meta.dirname, 'build/server.js')
  },
  entry: () => import('./example/app.js')
});

export default config;
