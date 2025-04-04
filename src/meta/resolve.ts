import * as fs from 'node:fs';
import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';

export function resolveAbsolutePath(
  filename: string,
  baseDir: string
): Result<string, typeof RuntimeException.Instance> {
  const filepath = path.resolve(baseDir, filename);
  if (!fs.existsSync(filepath)) {
    return RuntimeException.asErr(`File does not exist: ${filepath}`);
  } else if (!fs.lstatSync(filepath).isFile()) {
    return RuntimeException.asErr(`Not a file: ${filepath}`);
  }
  return ok(filepath);
}

export function resolveAbsoluteImportPath(
  filename: string,
  baseDir: string
): Result<string, typeof RuntimeException.Instance> {
  return resolveAbsolutePath(filename, baseDir).andThen((filepath) => {
    const extension = path.extname(filepath);
    if (!(extension === '.js' || extension === '.ts')) {
      return RuntimeException.asErr(`Unexpected file extension '${extension}': must be '.js' or '.ts'`);
    }
    return ok(filepath);
  });
}

export function resolveUserConfig(baseDir: string): Result<string, typeof RuntimeException.Instance> {
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
