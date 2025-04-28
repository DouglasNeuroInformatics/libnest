import { ExceptionBuilder, RuntimeException } from '@douglasneuroinformatics/libjs';
import * as lexer from 'es-module-lexer';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { Node, SourceFile, Symbol } from 'ts-morph';

await lexer.init;

const { SyntaxParsingException } = new ExceptionBuilder().setParams({ name: 'SyntaxParsingException' }).build();

function resolveAliasedSymbol(symbol: Symbol): Symbol {
  let current = symbol;
  while (current.getAliasedSymbol()) {
    current = current.getAliasedSymbol()!;
  }
  return current;
}

export function parseDefaultExportNode(sourceFile: SourceFile): Result<Node, typeof SyntaxParsingException.Instance> {
  const filename = sourceFile.getBaseName();
  const defaultExportSymbol = sourceFile.getDefaultExportSymbol();
  if (!defaultExportSymbol) {
    return SyntaxParsingException.asErr(`Source file '${filename}' does not include a default export symbol`);
  }
  const resolvedSymbol = resolveAliasedSymbol(defaultExportSymbol);
  const declarations = resolvedSymbol.getDeclarations();
  if (declarations.length === 0) {
    return SyntaxParsingException.asErr(`Default export symbol in '${filename}' has no declarations`);
  }
  if (declarations.length > 1) {
    return SyntaxParsingException.asErr(
      `Default export symbol in '${filename}' has multiple declarations (${declarations.length})`
    );
  }
  return ok(declarations[0]!);
}

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
