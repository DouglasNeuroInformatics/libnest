import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const BIN = path.resolve(import.meta.dirname, '../bin/libnest');

/**
 * An application whose config file imports JSON, and imports through a path alias although the
 * tsconfig does not include it. The app container is the one libnest checks the entry against.
 */
const FIXTURE_FILES = {
  'libnest.config.ts': [
    "import * as path from 'node:path';",
    "import { name } from '@/name.js';",
    "import release from './release.json' with { type: 'json' };",
    'type Config = { build: { outfile: string }; entry: () => Promise<unknown>; globals: { [key: string]: unknown } };',
    'export default {',
    "  build: { outfile: path.join(import.meta.dirname, 'dist/app.js') },",
    "  entry: () => import('./src/app.js'),",
    '  globals: { __RELEASE__: { name, version: release.version } }',
    '} satisfies Config;'
  ].join('\n'),
  'package.json': JSON.stringify({ type: 'module' }),
  'release.json': JSON.stringify({ version: '1.2.3' }),
  'src/app.ts': [
    `import { AbstractAppContainer } from '${path.resolve(import.meta.dirname, '../../app/app.base.js')}';`,
    'declare const __RELEASE__: { name: string; version: string };',
    'class AppContainer extends AbstractAppContainer {',
    '  async bootstrap(): Promise<void> {',
    '    console.log(`bootstrapped ${__RELEASE__.name}@${__RELEASE__.version}`);',
    '  }',
    '  createApplicationInstance(): never {',
    "    throw new Error('Not implemented');",
    '  }',
    '}',
    'export default new AppContainer({ envConfig: {}, module: {}, version: null } as never);'
  ].join('\n'),
  'src/name.ts': "export const name: string = 'fixture';",
  'tsconfig.json': JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } }, include: ['src'] })
};

describe('bin/libnest', () => {
  let root: string;

  const run = async (file: string, args: string[]): Promise<string> => {
    const { stdout } = await promisify(execFile)(file, args, {
      cwd: root,
      // the executable starts whichever `node` comes first on the path
      env: { PATH: [path.dirname(process.execPath), process.env.PATH].join(path.delimiter) }
    });
    return stdout;
  };

  beforeAll(async () => {
    // oxc-resolver returns real paths, and the temporary directory is a symlink on macOS
    root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'libnest-bin-')));
    for (const [filename, contents] of Object.entries(FIXTURE_FILES)) {
      await fs.mkdir(path.dirname(path.join(root, filename)), { recursive: true });
      await fs.writeFile(path.join(root, filename), contents);
    }
  });

  afterAll(async () => {
    await fs.rm(root, { force: true, recursive: true });
  });

  it('should bootstrap an application written in TypeScript in development', async () => {
    await expect(run(BIN, ['dev', '-c', 'libnest.config.ts', '--no-watch'])).resolves.toBe(
      'bootstrapped fixture@1.2.3\n'
    );
  });

  it('should build an application written in TypeScript into a bundle that bootstraps it', async () => {
    await run(BIN, ['build', '-c', 'libnest.config.ts']);
    await expect(run(process.execPath, ['dist/app.js'])).resolves.toBe('bootstrapped fixture@1.2.3\n');
  });
});
