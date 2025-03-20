import type { PluginBuild } from 'esbuild';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { docsPlugin } from '../docs.js';

const fs = vi.hoisted(() => ({
  cp: vi.fn()
}));

vi.mock('node:fs/promises', () => fs);

describe('docsPlugin', () => {
  const build = {
    initialOptions: {
      outdir: '/app'
    },
    onEnd: vi.fn()
  } satisfies Partial<{ [K in keyof PluginBuild]: any }>;
  const plugin = docsPlugin();

  beforeEach(async () => {
    await plugin.setup(build as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register the onEnd callback', () => {
    expect(build.onEnd).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
  });

  it('should copy the assets to the target directory', async () => {
    const onEnd = build.onEnd.mock.lastCall![0] as () => Promise<void>;
    await onEnd();
    expect(fs.cp).toHaveBeenCalledOnce();
  });
});
