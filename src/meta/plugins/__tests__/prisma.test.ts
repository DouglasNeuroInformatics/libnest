import * as path from 'node:path';

import type { PluginBuild } from 'esbuild';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

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
  existsSync: vi.fn(),
  promises: {
    copyFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn()
  }
}));

vi.mock('node:fs', () => fs);

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
  const build = { onEnd: vi.fn() } satisfies Partial<{ [K in keyof PluginBuild]: Mock }>;
  const plugin = prismaPlugin({
    outdir: '/dev/null'
  });

  beforeEach(async () => {
    await plugin.setup(build as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register the onEnd callback', () => {
    expect(build.onEnd).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
  });

  it('should return an error if it cannot find the engine', async () => {
    fs.promises.readdir.mockResolvedValueOnce([]);
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    const result = await onEnd();
    expect(result).toStrictEqual({
      errors: [
        {
          text: `Failed to find prisma query engine for target '${mockBinaryTarget}' in directory '${mockEnginesPath}'`
        }
      ]
    });
    expect(fs.promises.readdir).toHaveBeenCalledExactlyOnceWith(mockEnginesPath);
  });

  it('should attempt to create the output directory if it does not exist', async () => {
    fs.promises.readdir.mockResolvedValueOnce([mockTargetFile]);
    fs.existsSync.mockReturnValueOnce(false);
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    await onEnd();
    expect(fs.promises.mkdir).toHaveBeenCalled();
  });

  it('should copy the binary to the target directory', async () => {
    fs.promises.readdir.mockResolvedValueOnce([mockTargetFile]);
    fs.existsSync.mockReturnValueOnce(true);
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    await onEnd();
    expect(fs.promises.mkdir).not.toHaveBeenCalled();
    expect(fs.promises.copyFile).toHaveBeenCalledExactlyOnceWith(
      path.join(mockEnginesPath, mockTargetFile),
      path.join('/dev/null', mockTargetFile)
    );
  });
});
