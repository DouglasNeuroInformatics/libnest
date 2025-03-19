import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { fromAsyncThrowable, ok } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';

function importDefault(filepath: string): ResultAsync<unknown, typeof RuntimeException.Instance> {
  if (!path.isAbsolute(filepath)) {
    return RuntimeException.asAsyncErr(`Expected absolute path for import: ${filepath}`);
  }
  return fromAsyncThrowable(
    () => import(filepath),
    (error) =>
      new RuntimeException(`Failed to import module: ${filepath}`, {
        cause: error
      })
  )().andThen(({ default: defaultExport }) => {
    if (defaultExport === undefined) {
      return RuntimeException.asErr(`Missing required default export in module: ${filepath}`);
    }
    return ok(defaultExport);
  });
}

export { importDefault };
