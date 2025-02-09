import { z } from 'zod';

import { AppFactory } from '../src/core/index.js';
import { CatsModule } from './cats/cats.module.js';

export const AppModule = AppFactory.createModule({
  imports: [CatsModule],
  schema: z.object({})
});
