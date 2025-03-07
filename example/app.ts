import { $BaseEnv, AppFactory } from '../src/index.js';
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
  prisma: {
    dbPrefix: null
  },
  version: '1'
});
