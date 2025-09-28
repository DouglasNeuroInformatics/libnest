import { $BaseEnv, acceptLanguage, AppFactory } from '../src/index.js';
import { AppModule } from './app.module.js';

export default AppFactory.create({
  configureMiddleware: (consumer) => {
    const middleware = acceptLanguage({ fallbackLanguage: 'en', supportedLanguages: ['en', 'fr'] });
    consumer.apply(middleware).forRoutes('*');
  },
  docs: {
    path: '/docs',
    title: 'Example API'
  },
  envSchema: $BaseEnv,
  imports: [AppModule],
  version: null
});
