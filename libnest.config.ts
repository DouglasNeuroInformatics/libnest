import * as path from 'node:path';

import { defineUserConfig } from './src/user-config.js';

export default defineUserConfig({
  build: {
    outfile: path.resolve(import.meta.dirname, 'build/server.js')
  },
  entry: () => import('./example/app.js')
});
