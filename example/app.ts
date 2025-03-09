import { $BaseEnv, AppContainer } from '../src/index.js';
import { CatsModule } from './cats/cats.module.js';

export default await AppContainer.create({
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
