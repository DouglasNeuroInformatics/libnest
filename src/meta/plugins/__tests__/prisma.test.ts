import * as path from 'node:path';

import type { PluginBuild } from 'esbuild';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { prismaPlugin } from '../prisma.js';

const { getBinaryTargetForCurrentPlatform, getEnginesPath, mockBinaryTarget, mockEnginesPath, mockTargetFile } =
  vi.hoisted(() => {
    const mockBinaryTarget = 'darwin-arm64';
    const mockEnginesPath = '/lib/prisma-engines';
    return {
      getBinaryTargetForCurrentPlatform: vi.fn().mockResolvedValue(mockBinaryTarget),
      getEnginesPath: vi.fn().mockReturnValue(mockEnginesPath),
      mockBinaryTarget,
      mockEnginesPath,
      mockTargetFile: 'libquery_engine-darwin-arm64.dylib.node'
    };
  });

const fs = vi.hoisted(() => ({
  copyFile: vi.fn(),
  readdir: vi.fn()
}));

vi.mock('node:fs/promises', () => fs);

vi.mock('node:module', () => ({
  createRequire: () => {
    return (id: string) => {
      switch (id) {
        case '@prisma/engines':
          return { getEnginesPath };
        case '@prisma/get-platform':
          return { getBinaryTargetForCurrentPlatform };
        default:
          throw new Error(`Unexpected require of module: ${id}`);
      }
    };
  }
}));

describe('prismaPlugin', () => {
  const build = {
    initialOptions: {
      banner: {
        js: ''
      },
      outdir: '/app'
    },
    onEnd: vi.fn()
  } satisfies Partial<{ [K in keyof PluginBuild]: any }>;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if it cannot find the engine', async () => {
    fs.readdir.mockResolvedValueOnce([]);
    const plugin = prismaPlugin();
    await expect(() => plugin.setup(build as any)).rejects.toThrowError(
      `Failed to find prisma query engine for target '${mockBinaryTarget}' in directory '${mockEnginesPath}'`
    );
  });

  it('should copy the binary to the target directory', async () => {
    fs.readdir.mockResolvedValueOnce([mockTargetFile]);
    const plugin = prismaPlugin();
    await plugin.setup(build as any);
    expect(build.onEnd).toHaveBeenCalledOnce();
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    await onEnd();
    expect(fs.copyFile).toHaveBeenCalledExactlyOnceWith(
      path.join(mockEnginesPath, mockTargetFile),
      path.join('/app', mockTargetFile)
    );
  });
});
