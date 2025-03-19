import * as path from 'node:path';

import type { PluginBuild } from 'esbuild';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
      outdir: '/app'
    },
    onEnd: vi.fn()
  } satisfies Partial<{ [K in keyof PluginBuild]: any }>;
  const plugin = prismaPlugin();

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
    fs.readdir.mockResolvedValueOnce([]);
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    const result = await onEnd();
    expect(result).toStrictEqual({
      errors: [
        {
          text: `Failed to find prisma query engine for target '${mockBinaryTarget}' in directory '${mockEnginesPath}'`
        }
      ]
    });
    expect(fs.readdir).toHaveBeenCalledExactlyOnceWith(mockEnginesPath);
  });

  it('should copy the binary to the target directory', async () => {
    fs.readdir.mockResolvedValueOnce([mockTargetFile]);
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    await onEnd();
    expect(fs.copyFile).toHaveBeenCalledExactlyOnceWith(
      path.join(mockEnginesPath, mockTargetFile),
      path.join('/app', mockTargetFile)
    );
  });
});
