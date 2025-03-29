import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vitest/config.js';

import plugin from '../plugin.js';

describe('plugin', () => {
  let libnest: Plugin;
  let swc: Plugin;

  beforeAll(() => {
    [swc, libnest] = plugin();
  });

  describe('swc', () => {
    it('should have the correct name', () => {
      expect(swc.name).toBe('swc');
    });
  });

  describe('libnest', () => {
    it('should handle @swc/helpers imports', async () => {
      const resolve = vi.fn().mockResolvedValue('/resolved/path');
      const resolveId = (libnest.resolveId as (...args: any[]) => any).bind({
        resolve
      });
      const result = await resolveId('@swc/helpers/foo', 'test.ts', {});
      expect(result).toBe('/resolved/path');
    });
    it('should passthrough other imports', async () => {
      const resolveId = libnest.resolveId as (...args: any[]) => any;
      const result = await resolveId('node:path', 'test.ts', {});
      expect(result).toBe(null);
    });
  });
});
