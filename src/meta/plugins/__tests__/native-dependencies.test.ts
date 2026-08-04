import * as path from 'node:path';

import type { PluginBuild } from 'esbuild';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { nativeDependenciesPlugin } from '../native-dependencies.js';

import type { NativeDependency } from '../../../user-config.js';

const fs = vi.hoisted(() => ({
  chmod: vi.fn(),
  copyFile: vi.fn()
}));

vi.mock('node:fs/promises', () => fs);

const createRequire = vi.hoisted(() => vi.fn());

vi.mock('node:module', () => ({ createRequire }));

const ENTRY_PATH = '/pkgs/widget/lib/main.js';
const ARTIFACT_PATH = '/pkgs/widget-linux-x64/bin/widget';

const dependency: NativeDependency = {
  locate: vi.fn(() => ARTIFACT_PATH),
  outputName: 'widget',
  packageName: 'widget',
  runtimeEnvVar: 'WIDGET_BINARY_PATH'
};

/**
 * A stub of the subset of `PluginBuild` the plugin touches, exposing the two registered callbacks so a
 * test can drive resolution and completion directly.
 */
function createBuild({ resolvedPath = ENTRY_PATH }: { resolvedPath?: string } = {}) {
  const build = {
    initialOptions: {
      banner: { js: '' },
      outdir: '/app'
    },
    onEnd: vi.fn(),
    onResolve: vi.fn(),
    resolve: vi.fn().mockResolvedValue({ path: resolvedPath })
  } satisfies Partial<{ [K in keyof PluginBuild]: any }>;
  return {
    build,
    onEnd: () => build.onEnd.mock.lastCall![0] as () => Promise<void>,
    onResolve: () =>
      build.onResolve.mock.lastCall![1] as (args: { kind: string; path: string; resolveDir: string }) => Promise<null>
  };
}

const resolveArgs = (specifier: string) => ({ kind: 'import-statement', path: specifier, resolveDir: '/app' });

describe('nativeDependenciesPlugin', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should assign the environment variable without overwriting one supplied by the operator', async () => {
    const { build } = createBuild();
    await nativeDependenciesPlugin([dependency]).setup(build as any);
    expect(build.initialOptions.banner.js).toBe("process.env.WIDGET_BINARY_PATH ??= import.meta.dirname + '/widget';");
  });

  it('should terminate its banner statement, so a second appending plugin still parses', async () => {
    const { build } = createBuild();
    await nativeDependenciesPlugin([dependency]).setup(build as any);
    expect(build.initialOptions.banner.js.endsWith(';')).toBe(true);
  });

  it('should emit the artifact beside the bundle and make it executable', async () => {
    const { build, onEnd, onResolve } = createBuild();
    createRequire.mockReturnValue({ resolve: vi.fn() });
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await onResolve()(resolveArgs('widget'));
    await onEnd()();

    expect(dependency.locate).toHaveBeenCalledWith(expect.objectContaining({ entryPath: ENTRY_PATH }));
    expect(fs.copyFile).toHaveBeenCalledExactlyOnceWith(ARTIFACT_PATH, path.join('/app', 'widget'));
    expect(fs.chmod).toHaveBeenCalledExactlyOnceWith(path.join('/app', 'widget'), 0o755);
  });

  it('should write beside the bundle when the output is an outfile rather than an outdir', async () => {
    const { build, onEnd, onResolve } = createBuild();
    createRequire.mockReturnValue({ resolve: vi.fn() });
    const outfileBuild = {
      ...build,
      initialOptions: { banner: { js: '' }, outfile: '/dist/server.js' }
    };
    await nativeDependenciesPlugin([dependency]).setup(outfileBuild as any);

    await onResolve()(resolveArgs('widget'));
    await onEnd()();

    expect(fs.copyFile).toHaveBeenCalledExactlyOnceWith(ARTIFACT_PATH, path.join('/dist', 'widget'));
  });

  it('should locate the artifact through a require rooted at the importing module, not at libnest', async () => {
    const { build, onEnd, onResolve } = createBuild();
    const requireFn = { resolve: vi.fn() };
    createRequire.mockReturnValue(requireFn);
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await onResolve()(resolveArgs('widget'));
    await onEnd()();

    expect(createRequire).toHaveBeenCalledWith(ENTRY_PATH);
    expect(dependency.locate).toHaveBeenCalledWith({ entryPath: ENTRY_PATH, require: requireFn });
  });

  it('should match a subpath import of a declared dependency', async () => {
    const { build, onResolve } = createBuild();
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await onResolve()(resolveArgs('widget/lib/main.js'));

    expect(build.resolve).toHaveBeenCalledOnce();
  });

  it('should ignore an import that is not a declared dependency', async () => {
    const { build, onResolve } = createBuild();
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await expect(onResolve()(resolveArgs('widgetry'))).resolves.toBeNull();
    expect(build.resolve).not.toHaveBeenCalled();
  });

  it('should resolve a dependency only once however many times it is imported', async () => {
    const { build, onResolve } = createBuild();
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await onResolve()(resolveArgs('widget'));
    await onResolve()(resolveArgs('widget'));

    expect(build.resolve).toHaveBeenCalledOnce();
  });

  it('should throw when a declared dependency is never imported, rather than emitting a bundle pointing at nothing', async () => {
    const { build, onEnd } = createBuild();
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await expect(onEnd()()).rejects.toThrowError(
      "Declared native dependency 'widget' was never imported by the application, so its native artifact cannot be located"
    );
    expect(fs.copyFile).not.toHaveBeenCalled();
  });

  it('should throw when a declared dependency cannot be resolved, so an unresolved import is not silently skipped', async () => {
    const { build, onEnd, onResolve } = createBuild({ resolvedPath: '' });
    await nativeDependenciesPlugin([dependency]).setup(build as any);

    await onResolve()(resolveArgs('widget'));

    await expect(onEnd()()).rejects.toThrowError("Declared native dependency 'widget' was never imported");
  });
});
