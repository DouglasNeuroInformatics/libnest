import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { swcPlugin } from '../swc.js';

const fs = vi.hoisted(() => ({
  readFile: vi.fn()
})) satisfies { [K in keyof typeof import('node:fs/promises')]?: Mock };

const swc = vi.hoisted(() => ({
  transform: vi.fn()
}));

vi.mock('node:fs/promises', () => fs);
vi.mock('@swc/core', () => swc);

describe('swcPlugin', () => {
  it('should transform TypeScript code using SWC', async () => {
    const mockTsCode = `const x: number = 42;`;
    const mockTransformedCode = `const x = 42;`;
    fs.readFile.mockResolvedValueOnce(mockTsCode);
    swc.transform.mockResolvedValue({ code: mockTransformedCode });

    const plugin = swcPlugin();

    const buildMock = {
      onLoad: vi.fn((_options, callback) => {
        callback({ path: 'test.ts' }).then((result: any) => {
          expect(fs.readFile).toHaveBeenCalledWith('test.ts', 'utf-8');
          expect(swc.transform).toHaveBeenCalledWith(mockTsCode, expect.any(Object));
          expect(result).toEqual({ contents: mockTransformedCode, loader: 'js' });
        });
      })
    };
    await plugin.setup(buildMock as any);
    expect(buildMock.onLoad).toHaveBeenCalledWith({ filter: /\.(ts)$/ }, expect.any(Function));
  });
});
