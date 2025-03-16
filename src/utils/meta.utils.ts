import * as fs from 'node:fs';
import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';

export function findConfigFile(baseDir: string): Result<string, typeof RuntimeException.Instance> {
  const searched: string[] = [];

  let searchDir = baseDir;
  do {
    const entries = fs.readdirSync(searchDir);
    for (const entry of entries) {
      if (/libnest\.config\.(t|j)s/.exec(entry)) {
        return ok(path.resolve(searchDir, entry));
      }
    }
    searched.push(searchDir);
    searchDir = path.dirname(searchDir);
  } while (searchDir !== searched.at(-1));

  return RuntimeException.asErr('Failed to find libnest config file', {
    details: {
      searched
    }
  });
}
