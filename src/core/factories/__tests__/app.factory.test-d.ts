import { expectTypeOf } from 'expect-type';
import { z } from 'zod';

import type { CreateAppOptions } from '../app.factory.js';
import type { InternalDynamicModule } from '../internal-module.factory.js';

class DummyModule {}

const InternalModule = {} as InternalDynamicModule;

expectTypeOf({ imports: [DummyModule], schema: z.object({}) }).toMatchTypeOf<CreateAppOptions>();

expectTypeOf({ imports: [DummyModule, InternalModule], schema: z.object({}) }).not.toMatchTypeOf<CreateAppOptions>();
