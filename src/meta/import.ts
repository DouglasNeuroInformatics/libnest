import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { fromAsyncThrowable, ok } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';

function importDefault(filepath: string): ResultAsync<unknown, typeof RuntimeException.Instance>;
function importDefault(
  importFn: () => Promise<{ [key: string]: unknown }>
): ResultAsync<unknown, typeof RuntimeException.Instance>;
function importDefault(
  argument: (() => Promise<{ [key: string]: unknown }>) | string
): ResultAsync<unknown, typeof RuntimeException.Instance> {
  let importFn: () => Promise<{ [key: string]: unknown }>;
  let context: string;
  if (typeof argument === 'function') {
    importFn = argument;
    context = `module inferred as return value from function '${importFn.name || 'anonymous'}'`;
  } else {
    importFn = (): Promise<{ [key: string]: unknown }> => import(argument);
    context = argument;
  }
  return fromAsyncThrowable(
    importFn,
    (error) =>
      new RuntimeException(`Failed to import module: ${context}`, {
        cause: error
      })
  )().andThen(({ default: defaultExport }) => {
    if (defaultExport === undefined) {
      return RuntimeException.asErr(`Missing required default export in module: ${context}`);
    }
    return ok(defaultExport);
  });
}

export { importDefault };
