import { Global, Module } from '@nestjs/common';

import { REACT_DOM_SERVER_TOKEN } from './jsx.config.js';
import { JSXService } from './jsx.service.js';

@Global()
@Module({
  exports: [JSXService],
  providers: [
    {
      provide: REACT_DOM_SERVER_TOKEN,
      useFactory: async (): Promise<typeof import('react-dom/server')> => {
        return import('react-dom/server');
      }
    },
    JSXService
  ]
})
export class JSXModule {}
