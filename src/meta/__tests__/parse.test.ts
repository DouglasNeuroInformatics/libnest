import { Project } from 'ts-morph';
import { describe, expect, it } from 'vitest';

import { parseDefaultExport, parseEntryFromFunction } from '../parse.js';

const project = new Project();

describe('parseDefaultExport', () => {
  it('should return an error if the source code does not contain a default export', () => {
    const sourceCode = "const config = { value: 'foo' };";
    const sourceFile = project.createSourceFile('config.ts', sourceCode);
    expect(parseDefaultExport(sourceFile)).toMatchObject({
      error: {
        message: "Source file 'config.ts' does not include a default export symbol"
      }
    });
  });
  it('should return an error if the default export does not reference anything', () => {
    const sourceCode = 'export default config;';
    const sourceFile = project.createSourceFile('config.ts', sourceCode, { overwrite: true });
    expect(parseDefaultExport(sourceFile)).toMatchObject({
      error: {
        message: "Default export symbol in 'config.ts' has no declarations"
      }
    });
  });
  it('should return an error if the default export has multiple references', () => {
    const sourceCode = 'var config = {}; var config = {}; export default config;';
    const sourceFile = project.createSourceFile('config.ts', sourceCode, { overwrite: true });
    expect(parseDefaultExport(sourceFile)).toMatchObject({
      error: {
        message: "Default export symbol in 'config.ts' has multiple declarations (2)"
      }
    });
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
