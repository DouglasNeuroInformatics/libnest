import { RuntimeException } from '@douglasneuroinformatics/libjs';
import * as lexer from 'es-module-lexer';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';

await lexer.init;

export function parseEntryFromFunction(
  entry: (...args: any[]) => any
): Result<string, typeof RuntimeException.Instance> {
  const source = entry.toString();
  const [imports] = lexer.parse(source);
  if (imports.length !== 1) {
    return RuntimeException.asErr(`Entry function must include exactly one import: found ${imports.length}`, {
      details: {
        source
      }
    });
  }
  const importSpecifier = imports[0]!;
  if (importSpecifier.t !== lexer.ImportType.Dynamic) {
    return RuntimeException.asErr(
      `Entry function must contain dynamic import: found ${lexer.ImportType[importSpecifier.t]}`,
      {
        details: {
          source
        }
      }
    );
  } else if (!importSpecifier.n) {
    return RuntimeException.asErr('Dynamic import in entry function must import a string literal', {
      details: {
        source
      }
    });
  }
  return ok(importSpecifier.n);
}
