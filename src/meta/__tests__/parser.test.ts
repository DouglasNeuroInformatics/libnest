import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Parser } from '../parser.js';

const fs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

vi.mock('node:fs', () => fs);

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
    fs.existsSync.mockReturnValue(true);
  });

  describe('parseUserConfig', () => {
    it('should return an error if the provided file does not exist', () => {
      fs.existsSync.mockReturnValueOnce(false);
      expect(parser.parseUserConfig('config.ts')).toMatchObject({
        error: {
          message: `Config file does not exist: config.ts`
        }
      });
    });
    it('should return an error if the source code does not contain a default export', () => {
      const sourceCode = "const config = { value: 'foo' };";
      fs.readFileSync.mockReturnValueOnce(sourceCode);
      expect(parser.parseUserConfig('config.ts')).toMatchObject({
        error: {
          message: "Source file 'config.ts' does not include a default export symbol"
        }
      });
    });
    it('should return an error if the default export does not reference anything', () => {
      const sourceCode = 'export default config;';
      fs.readFileSync.mockReturnValueOnce(sourceCode);
      expect(parser.parseUserConfig('config.ts')).toMatchObject({
        error: {
          message: "Default export symbol in 'config.ts' has no declarations"
        }
      });
    });
    it('should return an error if the default export has multiple references', () => {
      const sourceCode = 'var config = {}; var config = {}; export default config;';
      fs.readFileSync.mockReturnValueOnce(sourceCode);
      expect(parser.parseUserConfig('config.ts')).toMatchObject({
        error: {
          message: "Default export symbol in 'config.ts' has multiple declarations (2)"
        }
      });
    });
    it('should return ok if the config can be parsed', () => {
      const sourceCode = 'const config = {}; export default config;';
      fs.readFileSync.mockReturnValueOnce(sourceCode);
      const result = parser.parseUserConfig('config.ts');
      expect(result.isOk()).toBe(true);
    });
  });
});
