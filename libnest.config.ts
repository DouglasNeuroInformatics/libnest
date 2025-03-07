import { defineUserConfig } from './src/user-config.js';

export default defineUserConfig({
  entry: () => import('./example/app.js')
});
