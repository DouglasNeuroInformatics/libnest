import type { Ok } from 'neverthrow';
import { ExportAssignment, Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { parseDefaultExportAssignment, parseEntryFromFunction } from '../parse.js';

const project = new Project({
  useInMemoryFileSystem: true
});

function createTestSourceFile(filepath: string, content: string) {
  return project.createSourceFile(filepath, content, { overwrite: true });
}

describe('parseDefaultExportAssignment', () => {
  it('should return an error if the source code does not contain a default export', () => {
    const sourceCode = "const config = { value: 'foo' };";
    const sourceFile = createTestSourceFile('config.ts', sourceCode);
    expect(parseDefaultExportAssignment(sourceFile)).toMatchObject({
      error: {
        message: "Source file 'config.ts' does not include a default export symbol"
      }
    });
  });
  it('should return an error if the default export does not reference anything', () => {
    const sourceCode = 'export default config;';
    const sourceFile = createTestSourceFile('config.ts', sourceCode);
    expect(parseDefaultExportAssignment(sourceFile)).toMatchObject({
      error: {
        message: "Default export symbol in 'config.ts' has no declarations"
      }
    });
  });
  it('should return an error if the default export has multiple references', () => {
    const sourceCode = 'var config = {}; var config = {}; export default config;';
    const sourceFile = createTestSourceFile('config.ts', sourceCode);
    expect(parseDefaultExportAssignment(sourceFile)).toMatchObject({
      error: {
        message: "Default export symbol in 'config.ts' has multiple declarations (2)"
      }
    });
  });
  it('should succeed on a simple default export (primitive)', () => {
    const file = createTestSourceFile('primitive.ts', `export default 123;`);
    const result = parseDefaultExportAssignment(file) as Ok<ExportAssignment, never>;
    expect(result.isOk()).toBe(true);
    expect(result.value.getKind()).toBe(SyntaxKind.ExportAssignment);
    expect(result.value.getExpression().getText()).toBe('123');
  });
});

describe('parseEntryFromFunction', () => {
  it('should return an error if there are no imports in the entry function', () => {
    expect(parseEntryFromFunction(() => Promise.resolve({}))).toMatchObject({
      error: {
        message: `Entry function must include exactly one import: found 0`
      }
    });
  });
  it('should return an error if the import expression is not a dynamic import', () => {
    const entry = { toString: () => "() => import.meta.resolve('./app.js')" } as any;
    expect(parseEntryFromFunction(entry)).toMatchObject({
      error: {
        message: 'Entry function must contain dynamic import: found ImportMeta'
      }
    });
  });
  it('should return an error if the dynamic import expression is not a string literal', () => {
    const entry = { toString: () => "() => import(`${'./' + 'ab.js'}`)" } as any;
    expect(parseEntryFromFunction(entry)).toMatchObject({
      error: {
        message: 'Dynamic import in entry function must import a string literal'
      }
    });
  });
  it('should return the result with the specifier', () => {
    const entry = { toString: () => "() => import('./app.js')" } as any;
    expect(parseEntryFromFunction(entry)).toMatchObject({
      value: './app.js'
    });
  });
});
