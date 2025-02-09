import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

import { describe, expect, it } from 'vitest';

const program = path.resolve(import.meta.dirname, '../cli.js');

describe('CLI', () => {
  it('should successfully output help', () => {
    const result = spawnSync(`node ${program} --help`, {
      encoding: 'utf-8',
      shell: true
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Usage: @douglasneuroinformatics/libnest');
  });
});
