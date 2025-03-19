import { describe, expect, it } from 'vitest';

import { parseEntryFromFunction } from '../parse.js';

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
