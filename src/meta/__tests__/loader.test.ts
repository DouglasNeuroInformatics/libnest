import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const LOADER_URL = pathToFileURL(path.resolve(import.meta.dirname, '../loader.js')).href;

const PACKAGE_JSON = JSON.stringify({ type: 'module' });

/**
 * Three applications: `app` has a tsconfig that includes only `src`, `bare` has no tsconfig, and the
 * tsconfig of `broken` extends a package that is not installed.
 */
const FIXTURE_FILES = {
  'app/node_modules/jsx/jsx-runtime.js': 'export const jsx = (type, props) => ({ props, type });',
  'app/node_modules/jsx/package.json': JSON.stringify({
    exports: { './jsx-runtime': './jsx-runtime.js' },
    name: 'jsx',
    type: 'module'
  }),
  'app/node_modules/pkg/index.js': "export default 'pkg';",
  'app/node_modules/pkg/package.json': JSON.stringify({ exports: './index.js', name: 'pkg', type: 'module' }),
  'app/other/origin.ts': "export const origin: string = 'other';",
  // conditions match in key order, so `development` must precede `default`
  'app/package.json':
    '{ "type": "module", "imports": { "#env": { "development": "./src/env.development.ts", "default": "./src/env.ts" } } }',
  'app/scripts/outside.ts': "import { origin } from '@/origin.js';\nexport default origin;",
  'app/src/both.js': 'export {};',
  'app/src/both.ts': 'export {};',
  'app/src/cats/cats.service.ts': 'export class CatsService {}',
  'app/src/common.cts': "module.exports = 'cts' satisfies string;",
  'app/src/counter.ts': 'export const url: string = import.meta.url;',
  'app/src/data.json': '{ "hello": "world" }',
  'app/src/env.development.ts': "export const env: string = 'development';",
  'app/src/env.ts': "export const env: string = 'default';",
  'app/src/extensions.ts': [
    "import mts from './module.mjs';",
    "import tsx from './view';",
    'export default { mts, tsx };'
  ].join('\n'),
  'app/src/json.ts': "import data from './data.json' with { type: 'json' };\nexport default data;",
  'app/src/legacy.js': "import { origin } from '@/origin.js';\nexport default origin;",
  'app/src/main.ts': [
    "import './reflect.js';",
    "import pkg from 'pkg';",
    "import { env } from '#env';",
    "import { CatsService } from '@/cats/cats.service';",
    'const Injectable = (): ClassDecorator => () => undefined;',
    '@Injectable()',
    'class AppService {',
    '  constructor(readonly catsService: CatsService) {}',
    '}',
    "const injected: (new () => unknown)[] = Reflect.get(AppService, 'design:paramtypes');",
    'export default { env, injected: injected.map((dependency) => dependency.name), pkg };'
  ].join('\n'),
  'app/src/module.mts': "export default 'mts' satisfies string;",
  'app/src/origin.ts': "export const origin: string = 'src';",
  'app/src/query.ts': [
    "const [first, second, third] = await Promise.all([import('./counter.js?v=1'), import('./counter.js?v=2#top'), import('./counter.js?v=1')]);",
    'export default { distinct: first !== second, shared: first === third, urls: [first.url, second.url] };'
  ].join('\n'),
  // stands in for reflect-metadata, recording on each class the metadata SWC emits for it
  'app/src/reflect.ts':
    'Object.assign(Reflect, { metadata: (key: string, value: unknown) => (target: object) => Object.assign(target, { [key]: value }) });',
  'app/src/throws.ts': [
    'type Padding = {',
    '  first: string;',
    '  second: string;',
    '};',
    "throw new Error('thrown');"
  ].join('\n'),
  'app/src/throws.tsx': [
    'type Padding = {',
    '  first: string;',
    '  second: string;',
    '};',
    "throw new Error('thrown');"
  ].join('\n'),
  'app/src/view.tsx': 'export default <p id="view">hi</p>;',
  'app/tsconfig.json': JSON.stringify({
    compilerOptions: { jsx: 'react-jsx', jsxImportSource: 'jsx', paths: { '@/*': ['./src/*'] } },
    include: ['src']
  }),
  'app/tsconfig.other.json': JSON.stringify({ compilerOptions: { paths: { '@/*': ['./other/*'] } } }),
  'bare/package.json': PACKAGE_JSON,
  'bare/src/main.ts': "import { origin } from './origin.js';\nexport default origin;",
  'bare/src/origin.ts': "export const origin: string = 'bare';",
  'broken/package.json': PACKAGE_JSON,
  'broken/src/main.ts': "import { origin } from '@/origin.js';\nexport default origin;",
  'broken/src/origin.ts': "export const origin: string = 'broken';",
  'broken/tsconfig.json': JSON.stringify({
    compilerOptions: { paths: { '@/*': ['./src/*'] } },
    extends: '@libnest/not-installed'
  }),
  // reports what importing the entry yields, as a child process cannot hand back a module
  'run.mjs': [
    "import { register } from 'node:module';",
    'const [loader, entry] = process.argv.slice(2);',
    'register(loader);',
    'const outcome = await import(entry).then(',
    '  (exports) => ({ value: exports.default }),',
    '  (error) => ({ error: error.stack })',
    ');',
    'process.stdout.write(JSON.stringify(outcome));'
  ].join('\n')
};

type ProjectEnv = { [key: string]: string };

describe('loader', () => {
  let root: string;

  const fixturePath = (filename: string): string => path.join(root, filename);

  const fixtureURL = (filename: string): string => pathToFileURL(fixturePath(filename)).href;

  beforeAll(async () => {
    // oxc-resolver returns real paths, and the temporary directory is a symlink on macOS
    root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'libnest-loader-')));
    for (const [filename, contents] of Object.entries(FIXTURE_FILES)) {
      await fs.mkdir(path.dirname(fixturePath(filename)), { recursive: true });
      await fs.writeFile(fixturePath(filename), contents);
    }
  });

  afterAll(async () => {
    await fs.rm(root, { force: true, recursive: true });
  });

  describe('registered with module.register', () => {
    const importEntry = async (
      entry: string,
      options: { cwd?: string; env?: ProjectEnv; execArgv?: string[] } = {}
    ): Promise<{ error?: string; value?: unknown }> => {
      const { stdout } = await promisify(execFile)(
        process.execPath,
        [...(options.execArgv ?? []), '--enable-source-maps', fixturePath('run.mjs'), LOADER_URL, fixtureURL(entry)],
        // the loader reads its tsconfig from the working directory and environment of the process
        { cwd: fixturePath(options.cwd ?? 'app'), env: options.env ?? {} }
      );
      return JSON.parse(stdout);
    };

    it('should run a TypeScript graph, emitting the constructor metadata NestJS injects dependencies from', async () => {
      await expect(importEntry('app/src/main.ts')).resolves.toEqual({
        value: { env: 'default', injected: ['CatsService'], pkg: 'pkg' }
      });
    });

    it('should resolve package imports with the conditions Node was started with', async () => {
      await expect(importEntry('app/src/main.ts', { execArgv: ['--conditions=development'] })).resolves.toMatchObject({
        value: { env: 'development' }
      });
    });

    it('should import JSON with an import attribute, which Node requires and SWC drops by default', async () => {
      await expect(importEntry('app/src/json.ts')).resolves.toEqual({ value: { hello: 'world' } });
    });

    it('should load one module instance per query and fragment of a specifier', async () => {
      await expect(importEntry('app/src/query.ts')).resolves.toEqual({
        value: {
          distinct: true,
          shared: true,
          urls: [`${fixtureURL('app/src/counter.ts')}?v=1`, `${fixtureURL('app/src/counter.ts')}?v=2#top`]
        }
      });
    });

    it.each(['app/scripts/outside.ts', 'app/src/legacy.js'])(
      'should resolve the path aliases of the project tsconfig for %s, which that tsconfig does not include',
      async (entry) => {
        await expect(importEntry(entry)).resolves.toEqual({ value: 'src' });
      }
    );

    it.each(['SWC_NODE_PROJECT', 'TS_NODE_PROJECT'] as const)(
      'should take the project tsconfig from %s, as @swc-node/register did',
      async (variable) => {
        await expect(
          importEntry('app/scripts/outside.ts', { env: { [variable]: 'tsconfig.other.json' } })
        ).resolves.toEqual({ value: 'other' });
      }
    );

    it('should run an application that has no tsconfig', async () => {
      await expect(importEntry('bare/src/main.ts', { cwd: 'bare' })).resolves.toEqual({ value: 'bare' });
    });

    it('should report why the project tsconfig cannot be loaded, rather than a missing package', async () => {
      const { error } = await importEntry('broken/src/main.ts', { cwd: 'broken' });
      expect(error).toContain('Tsconfig not found @libnest/not-installed');
      expect(error).toContain(`'@/origin.js' cannot be resolved from ${fixturePath('broken/src/main.ts')}`);
    });

    it('should load `.tsx` and `.mts` files, compiling JSX for the runtime the tsconfig names', async () => {
      await expect(importEntry('app/src/extensions.ts')).resolves.toEqual({
        value: { mts: 'mts', tsx: { props: { children: 'hi', id: 'view' }, type: 'p' } }
      });
    });

    it.each(['app/src/throws.ts', 'app/src/throws.tsx'])(
      'should map the stack trace of %s to the line of source that threw',
      async (entry) => {
        const { error } = await importEntry(entry);
        expect(error).toContain(`${fixturePath(entry)}:5:7`);
      }
    );
  });

  describe('hooks', () => {
    const importHooks = async (cwd: string, env: ProjectEnv = {}): Promise<typeof import('../loader.js')> => {
      // the hooks keep one resolver for the life of the process they are registered in
      vi.resetModules();
      vi.spyOn(process, 'cwd').mockReturnValue(fixturePath(cwd));
      vi.stubEnv('SWC_NODE_PROJECT', env.SWC_NODE_PROJECT);
      vi.stubEnv('TS_NODE_PROJECT', env.TS_NODE_PROJECT);
      return import('../loader.js');
    };

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    describe('resolve', () => {
      const nextResolve = vi.fn(() => ({ url: 'next:resolve' }));

      const createResolve = async (
        options: { cwd?: string; env?: ProjectEnv } = {}
      ): Promise<(specifier: string, parentURL: string | undefined, conditions?: string[]) => unknown> => {
        const { resolve } = await importHooks(options.cwd ?? 'app', options.env);
        return (specifier, parentURL, conditions = ['node', 'import']) => {
          return resolve(specifier, { conditions, importAttributes: {}, parentURL }, nextResolve);
        };
      };

      const resolveFrom = async (
        specifier: string,
        parentURL: string | undefined,
        options: { cwd?: string; env?: ProjectEnv } = {}
      ): Promise<unknown> => {
        const resolve = await createResolve(options);
        return resolve(specifier, parentURL);
      };

      it.each(['./cats/cats.service.js', './cats/cats.service', '@/cats/cats.service.js'])(
        'should resolve %s to the TypeScript file it names',
        async (specifier) => {
          await expect(resolveFrom(specifier, fixtureURL('app/src/main.ts'))).resolves.toEqual({
            shortCircuit: true,
            url: fixtureURL('app/src/cats/cats.service.ts')
          });
        }
      );

      it.each([
        ['./view', 'app/src/view.tsx'],
        ['./view.js', 'app/src/view.tsx'],
        ['./module.mjs', 'app/src/module.mts'],
        ['./common.cjs', 'app/src/common.cts']
      ])('should resolve %s to %s, the TypeScript file that compiles to it', async (specifier, filename) => {
        await expect(resolveFrom(specifier, fixtureURL('app/src/main.ts'))).resolves.toMatchObject({
          url: fixtureURL(filename)
        });
      });

      it('should resolve an extensionless specifier to JavaScript before TypeScript, as @swc-node/register did', async () => {
        await expect(resolveFrom('./both', fixtureURL('app/src/main.ts'))).resolves.toMatchObject({
          url: fixtureURL('app/src/both.js')
        });
      });

      it.each(['app/scripts/outside.ts', 'app/src/legacy.js'])(
        'should resolve a path alias imported from %s, which the project tsconfig does not include',
        async (importer) => {
          await expect(resolveFrom('@/origin.js', fixtureURL(importer))).resolves.toMatchObject({
            url: fixtureURL('app/src/origin.ts')
          });
        }
      );

      it('should prefer the tsconfig named by SWC_NODE_PROJECT to the one named by TS_NODE_PROJECT', async () => {
        const env = { SWC_NODE_PROJECT: 'tsconfig.other.json', TS_NODE_PROJECT: 'tsconfig.json' };
        await expect(resolveFrom('@/origin.js', fixtureURL('app/src/main.ts'), { env })).resolves.toMatchObject({
          url: fixtureURL('app/other/origin.ts')
        });
      });

      it('should take the tsconfig named by TS_NODE_PROJECT when SWC_NODE_PROJECT is not set', async () => {
        const env = { TS_NODE_PROJECT: fixturePath('app/tsconfig.other.json') };
        await expect(resolveFrom('@/origin.js', fixtureURL('app/src/main.ts'), { env })).resolves.toMatchObject({
          url: fixtureURL('app/other/origin.ts')
        });
      });

      it('should resolve without path aliases when the working directory has no tsconfig', async () => {
        await expect(
          resolveFrom('./origin.js', fixtureURL('bare/src/main.ts'), { cwd: 'bare' })
        ).resolves.toMatchObject({
          url: fixtureURL('bare/src/origin.ts')
        });
      });

      it('should resolve an absolute path imported from node_modules, which is how libnest loads the entry', async () => {
        const specifier = fixturePath('app/src/main.js');
        await expect(resolveFrom(specifier, fixtureURL('app/node_modules/pkg/index.js'))).resolves.toMatchObject({
          url: fixtureURL('app/src/main.ts')
        });
      });

      it('should resolve each package import with the conditions Node passes for it, so `--conditions` selects the same file', async () => {
        const resolve = await createResolve();
        const development = ['node', 'import', 'development'];
        await expect(resolve('#env', fixtureURL('app/src/main.ts'), development)).resolves.toMatchObject({
          url: fixtureURL('app/src/env.development.ts')
        });
        await expect(resolve('#env', fixtureURL('app/src/main.ts'))).resolves.toMatchObject({
          url: fixtureURL('app/src/env.ts')
        });
        await expect(resolve('#env', fixtureURL('app/src/main.ts'), development)).resolves.toMatchObject({
          url: fixtureURL('app/src/env.development.ts')
        });
      });

      it('should keep the query and fragment of a specifier on the URL, so each names its own module instance', async () => {
        await expect(resolveFrom('./counter.js?v=1#top', fixtureURL('app/src/main.ts'))).resolves.toMatchObject({
          url: `${fixtureURL('app/src/counter.ts')}?v=1#top`
        });
      });

      it('should leave a package in node_modules to Node, so dependencies resolve as they would without libnest', async () => {
        await expect(resolveFrom('pkg', fixtureURL('app/src/main.ts'))).resolves.toEqual({ url: 'next:resolve' });
      });

      it.each(['node:fs', 'fs', 'data:text/javascript,export {};', 'file:///app/src/main.js'])(
        'should leave %s, which needs no TypeScript resolution, to Node',
        async (specifier) => {
          await expect(resolveFrom(specifier, fixtureURL('app/src/main.ts'))).resolves.toEqual({ url: 'next:resolve' });
        }
      );

      it.each([undefined, 'data:text/javascript,export {};'])(
        'should leave an import whose parent is %s, and so not a file, to Node',
        async (parentURL) => {
          await expect(resolveFrom('./cats/cats.service.js', parentURL)).resolves.toEqual({ url: 'next:resolve' });
        }
      );

      it('should let Node resolve a specifier the TypeScript resolver cannot', async () => {
        await expect(resolveFrom('./missing.js', fixtureURL('app/src/main.ts'))).resolves.toEqual({
          url: 'next:resolve'
        });
      });

      it('should report why the TypeScript resolver failed when Node cannot resolve an application import either', async () => {
        const nodeError = new Error("Cannot find package '@/origin.js'");
        nextResolve.mockImplementationOnce(() => {
          throw nodeError;
        });
        const importer = fixturePath('broken/src/main.ts');
        await expect(resolveFrom('@/origin.js', pathToFileURL(importer).href, { cwd: 'broken' })).rejects.toMatchObject(
          {
            cause: nodeError,
            message: `Tsconfig not found @libnest/not-installed: '@/origin.js' cannot be resolved from ${importer}`
          }
        );
      });

      it('should rethrow the error of Node when Node rejects a package the TypeScript resolver found', async () => {
        const nodeError = new Error('Package subpath \'./internal\' is not defined by "exports"');
        nextResolve.mockImplementationOnce(() => {
          throw nodeError;
        });
        await expect(resolveFrom('pkg', fixtureURL('app/src/main.ts'))).rejects.toBe(nodeError);
      });

      it('should rethrow the error of Node when a dependency imports a package that is not installed', async () => {
        const nodeError = new Error("Cannot find package 'optional'");
        nextResolve.mockImplementationOnce(() => {
          throw nodeError;
        });
        await expect(resolveFrom('optional', fixtureURL('app/node_modules/pkg/index.js'))).rejects.toBe(nodeError);
      });
    });

    describe('load', () => {
      const nextLoad = vi.fn(() => ({ format: 'next:load' }));

      const loadURL = async (url: string): Promise<unknown> => {
        const { load } = await importHooks('app');
        return load(url, { conditions: [], format: undefined, importAttributes: {} }, nextLoad);
      };

      it('should compile `.ts` to a module with the decorator metadata NestJS injects dependencies from', async () => {
        await expect(loadURL(fixtureURL('app/src/main.ts'))).resolves.toEqual({
          format: 'module',
          shortCircuit: true,
          source: expect.stringContaining('"design:paramtypes"')
        });
      });

      it('should keep the import attributes of a `.ts` file', async () => {
        await expect(loadURL(fixtureURL('app/src/json.ts'))).resolves.toMatchObject({
          source: expect.stringMatching(/from '\.\/data\.json' with \{\s*type: 'json'\s*\}/)
        });
      });

      it('should compile the file a URL names when the URL carries a query', async () => {
        await expect(loadURL(`${fixtureURL('app/src/counter.ts')}?v=1`)).resolves.toMatchObject({
          format: 'module',
          source: expect.stringContaining('export const url = import.meta.url;')
        });
      });

      it('should compile `.tsx` with esbuild, which reads the JSX runtime from the tsconfig as the bundle does', async () => {
        await expect(loadURL(fixtureURL('app/src/view.tsx'))).resolves.toEqual({
          format: 'module',
          shortCircuit: true,
          source: expect.stringContaining('from "jsx/jsx-runtime"')
        });
      });

      it.each(['app/src/legacy.js', 'app/src/common.cts', 'app/src/data.json'])(
        'should leave %s, which Node loads itself, to Node',
        async (filename) => {
          await expect(loadURL(fixtureURL(filename))).resolves.toEqual({ format: 'next:load' });
        }
      );

      it('should leave a URL that is not a file to Node', async () => {
        await expect(loadURL('node:fs')).resolves.toEqual({ format: 'next:load' });
      });
    });
  });
});
