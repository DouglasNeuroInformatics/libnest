import type { Class } from 'type-fest';
import { z } from 'zod';

import { applyValidationSchema } from '../decorators/validation-schema.decorator.js';

function createDto<T extends z.ZodRawShape>(shape: T): Class<z.TypeOf<z.ZodObject<T>>> {
  const schema = z.object(shape);
  const Target = class {} as Class<z.TypeOf<typeof schema>>;
  applyValidationSchema(Target, schema);
  return Target;
}

export const DataTransferObject = Object.assign(createDto, {
  forSchema<T extends z.ZodRawShape>(this: typeof createDto, schema: z.ZodObject<T>) {
    return this(schema.shape);
  }
});
