import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vitest/config.js';

import plugin from '../plugin.js';

const fs = vi.hoisted(() => ({
  readdir: vi.fn()
}));

vi.mock('node:fs/promises', () => fs);

describe('plugin', () => {
  describe('swc', () => {
    it('should have the correct name', () => {
      const swc = plugin()[0];
      expect(swc.name).toBe('swc');
    });
  });

  describe('libnest', () => {
    describe('resolveId', () => {
      let libnest: Plugin;

      beforeEach(() => {
        libnest = plugin()[1];
      });

      it('should handle @swc/helpers imports', async () => {
        const resolve = vi.fn().mockResolvedValue('/resolved/path');
        const resolveId = (libnest.resolveId as (...args: any[]) => Promise<any>).bind({
          resolve
        });
        const result = await resolveId('@swc/helpers/foo', 'test.ts', {});
        expect(result).toBe('/resolved/path');
      });
      it('should passthrough other imports', async () => {
        const resolveId = libnest.resolveId as (...args: any[]) => Promise<any>;
        const result = await resolveId('node:path', 'test.ts', {});
        expect(result).toBe(null);
      });
    });

    describe('config', () => {
      it('should define the value of process.env.LIBNEST_CONFIG_FILEPATH as the config option, if it is passed explicitly', async () => {
        vi.stubEnv('LIBNEST_CONFIG_FILEPATH', '/dev/null');
        const libnest = plugin({
          config: '/root/libnest.config.js'
        })[1];
        const config = libnest.config as (...args: any[]) => Promise<any>;
        await expect(config()).resolves.toMatchObject({
          define: {
            'process.env.LIBNEST_CONFIG_FILEPATH': '"/root/libnest.config.js"'
          }
        });
        vi.stubEnv('LIBNEST_CONFIG_FILEPATH', undefined);
      });
      it('should define the value of process.env.LIBNEST_CONFIG_FILEPATH as the actual value, if it is defined', async () => {
        vi.stubEnv('LIBNEST_CONFIG_FILEPATH', '/dev/null');
        const libnest = plugin()[1];
        const config = libnest.config as (...args: any[]) => Promise<any>;
        await expect(config()).resolves.toMatchObject({
          define: {
            'process.env.LIBNEST_CONFIG_FILEPATH': '"/dev/null"'
          }
        });
        vi.stubEnv('LIBNEST_CONFIG_FILEPATH', undefined);
      });
      it('should search for the libnest config in the vitest root dir, if defined', async () => {
        fs.readdir.mockResolvedValueOnce(['libnest.config.js']);
        const libnest = plugin()[1];
        const config = libnest.config as (...args: any[]) => Promise<any>;
        await expect(config({ root: '/' })).resolves.toMatchObject({
          define: {
            'process.env.LIBNEST_CONFIG_FILEPATH': '"/libnest.config.js"'
          }
        });
      });
      it('should throw an error if the config file cannot be resolved', async () => {
        const libnest = plugin()[1];
        const config = libnest.config as (...args: any[]) => Promise<any>;
        await expect(config({})).rejects.toThrow(
          'Could not determine path to libnest config file: please specify it explicitly in the libnest vitest plugin options'
        );
      });
    });
  });
});
