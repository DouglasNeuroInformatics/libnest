import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { load, resolve } from '../loader.js';

const FIXTURE_FILES = {
  'node_modules/pkg/index.js': 'export {};',
  'node_modules/pkg/package.json': JSON.stringify({ exports: './index.js', name: 'pkg', type: 'module' }),
  // conditions match in key order, so `development` must precede `default`
  'package.json': '{ "imports": { "#env": { "development": "./src/env.development.ts", "default": "./src/env.ts" } } }',
  'src/cats/cats.service.ts': 'export class CatsService {}',
  'src/env.development.ts': 'export {};',
  'src/env.ts': 'export {};',
  'src/main.ts': [
    "import { CatsService } from './cats/cats.service.js';",
    'const Injectable = (): ClassDecorator => () => undefined;',
    '@Injectable()',
    'export class AppService {',
    '  constructor(private readonly catsService: CatsService) {}',
    '}'
  ].join('\n'),
  'tsconfig.json': JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } }, include: ['src'] })
};

describe('loader', () => {
  let root: string;

  const fixtureURL = (filename: string): string => pathToFileURL(path.join(root, filename)).href;

  beforeAll(async () => {
    // oxc-resolver returns real paths, and the temporary directory is a symlink on macOS
    root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'libnest-loader-')));
    for (const [filename, contents] of Object.entries(FIXTURE_FILES)) {
      await fs.mkdir(path.dirname(path.join(root, filename)), { recursive: true });
      await fs.writeFile(path.join(root, filename), contents);
    }
  });

  afterAll(async () => {
    await fs.rm(root, { force: true, recursive: true });
  });

  describe('resolve', () => {
    const nextResolve = vi.fn(() => ({ url: 'next:resolve' }));

    const resolveFrom = (specifier: string, parentURL: string | undefined, conditions = ['node', 'import']) => {
      return resolve(specifier, { conditions, importAttributes: {}, parentURL }, nextResolve);
    };

    it('should resolve a `.js` specifier to the TypeScript file it compiles from', async () => {
      await expect(resolveFrom('./cats/cats.service.js', fixtureURL('src/main.ts'))).resolves.toMatchObject({
        url: fixtureURL('src/cats/cats.service.ts')
      });
    });

    it('should resolve an extensionless specifier', async () => {
      await expect(resolveFrom('./cats/cats.service', fixtureURL('src/main.ts'))).resolves.toMatchObject({
        url: fixtureURL('src/cats/cats.service.ts')
      });
    });

    it('should resolve the path aliases of the tsconfig that includes the importing file', async () => {
      await expect(resolveFrom('@/cats/cats.service', fixtureURL('src/main.ts'))).resolves.toMatchObject({
        url: fixtureURL('src/cats/cats.service.ts')
      });
    });

    it('should resolve an absolute path imported from node_modules, which is how libnest loads the entry', async () => {
      const specifier = path.join(root, 'src/main.js');
      await expect(resolveFrom(specifier, fixtureURL('node_modules/pkg/index.js'))).resolves.toMatchObject({
        url: fixtureURL('src/main.ts')
      });
    });

    it('should resolve package imports with the conditions Node passes, so `--conditions` selects the same file', async () => {
      await expect(
        resolveFrom('#env', fixtureURL('src/main.ts'), ['node', 'import', 'development'])
      ).resolves.toMatchObject({ url: fixtureURL('src/env.development.ts') });
      await expect(resolveFrom('#env', fixtureURL('src/main.ts'))).resolves.toMatchObject({
        url: fixtureURL('src/env.ts')
      });
    });

    it('should leave a package in node_modules to Node, so dependencies resolve as they would without libnest', async () => {
      await expect(resolveFrom('pkg', fixtureURL('src/main.ts'))).resolves.toEqual({ url: 'next:resolve' });
    });

    it('should leave a specifier it cannot resolve to Node, which reports the failure', async () => {
      await expect(resolveFrom('./missing.js', fixtureURL('src/main.ts'))).resolves.toEqual({ url: 'next:resolve' });
    });

    it('should leave a builtin module to Node', async () => {
      await expect(resolveFrom('node:fs', fixtureURL('src/main.ts'))).resolves.toEqual({ url: 'next:resolve' });
    });

    it('should leave the entry point, which has no parent, to Node', async () => {
      await expect(resolveFrom(fixtureURL('src/main.ts'), undefined)).resolves.toEqual({ url: 'next:resolve' });
    });
  });

  describe('load', () => {
    const nextLoad = vi.fn(() => ({ format: 'next:load' }));

    const loadURL = (url: string) => load(url, { conditions: [], format: undefined, importAttributes: {} }, nextLoad);

    it('should compile TypeScript to a module with the decorator metadata NestJS injects dependencies from', async () => {
      await expect(loadURL(fixtureURL('src/main.ts'))).resolves.toMatchObject({
        format: 'module',
        source: expect.stringContaining('"design:paramtypes"')
      });
    });

    it('should inline a source map, so stack traces point into the TypeScript source', async () => {
      await expect(loadURL(fixtureURL('src/main.ts'))).resolves.toMatchObject({
        source: expect.stringContaining('//# sourceMappingURL=data:application/json;base64,')
      });
    });

    it('should leave a file that is not TypeScript to Node', async () => {
      await expect(loadURL(fixtureURL('node_modules/pkg/index.js'))).resolves.toEqual({ format: 'next:load' });
    });

    it('should leave a URL that is not a file to Node', async () => {
      await expect(loadURL('node:fs')).resolves.toEqual({ format: 'next:load' });
    });
  });
});
