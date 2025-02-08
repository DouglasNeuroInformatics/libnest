import * as path from 'node:path';

import { defineConfig } from './src/index.js';

export default defineConfig({
  entry: path.resolve(import.meta.dirname, 'example/bootstrap.ts')
});
