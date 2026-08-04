import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { GLOBALS_BANNER } from '../build.js';

const execFileAsync = promisify(execFile);

/**
 * The banner that `@prisma/client` >= 6.19.3 prepends to its ESM runtime, which esbuild inlines into
 * the application bundle verbatim. The assignment to `globalThis` is the part that matters.
 */
const DEPENDENCY_BANNER = [
  'import * as __banner_node_path from "node:path";',
  'import * as __banner_node_url from "node:url";',
  'const __filename = __banner_node_url.fileURLToPath(import.meta.url);',
  "globalThis['__dirname'] = __banner_node_path.dirname(__filename);"
].join('\n');

describe('GLOBALS_BANNER', () => {
  let outdir: string;

  beforeAll(async () => {
    outdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'globals-banner-'));
  });

  afterAll(async () => {
    await fs.promises.rm(outdir, { force: true, recursive: true });
  });

  it('should define the commonjs globals', () => {
    expect(GLOBALS_BANNER).toContain('__dirname');
    expect(GLOBALS_BANNER).toContain('__filename');
    expect(GLOBALS_BANNER).toContain('require');
  });

  it('should not leave a bundled dependency unable to assign to globalThis', { timeout: 30000 }, async () => {
    const esbuild = await import('esbuild');
    const srcdir = path.join(outdir, 'src');
    await fs.promises.mkdir(srcdir, { recursive: true });
    await fs.promises.writeFile(
      path.join(srcdir, 'dependency.js'),
      `${DEPENDENCY_BANNER}\nexport const value = 'ok';\n`
    );
    await fs.promises.writeFile(
      path.join(srcdir, 'entry.js'),
      "import { value } from './dependency.js';\nconsole.log(value);\n"
    );

    const outfile = path.join(outdir, 'server.js');
    await esbuild.build({
      banner: { js: GLOBALS_BANNER },
      bundle: true,
      entryPoints: [path.join(srcdir, 'entry.js')],
      format: 'esm',
      outfile,
      platform: 'node'
    });

    // a non-writable property makes the inlined assignment throw, so the bundle dies before this resolves
    const { stdout } = await execFileAsync(process.execPath, [outfile]);
    expect(stdout.trim()).toBe('ok');
  });
});
