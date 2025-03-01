import { defineConfig } from './src/config/index.js';

export default defineConfig({
  entry: () => import('./example/app.js')
});
