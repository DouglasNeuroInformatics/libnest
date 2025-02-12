import { expectTypeOf } from 'expect-type';

import type { ImportedModule } from '../app.factory.js';
import type { InternalDynamicModule } from '../internal-module.factory.js';

class DummyModule {}

const InternalModule = {} as InternalDynamicModule;

expectTypeOf(DummyModule).toMatchTypeOf<ImportedModule>();

expectTypeOf(InternalModule).not.toMatchTypeOf<ImportedModule>();
