import { $BaseEnv } from '../src/config/index.js';
import { AppFactory } from '../src/core/index.js';
import { CatsModule } from './cats/cats.module.js';

export default AppFactory.create({
  docs: {
    config: {
      title: 'Example API'
    },
    path: '/spec.json'
  },
  envSchema: $BaseEnv,
  imports: [CatsModule],
  prisma: {},
  version: '1'
});
