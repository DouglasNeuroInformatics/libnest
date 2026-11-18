import * as fs from 'node:fs/promises';
import { isBuiltin } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { transform } from '@swc/core';
import { ResolverFactory } from 'oxc-resolver';

import { SWC_OPTIONS } from './swc-options.js';

/** @type {Map<string, ResolverFactory>} */
const resolversByConditions = new Map();

/**
 * @param {string[]} conditions
 * @returns {ResolverFactory}
 */
const getResolver = (conditions) => {
  const key = conditions.join(',');
  let resolver = resolversByConditions.get(key);
  if (!resolver) {
    resolver = new ResolverFactory({
      conditionNames: conditions,
      extensionAlias: { '.js': ['.ts', '.js'] },
      extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
      tsconfig: 'auto'
    });
    resolversByConditions.set(key, resolver);
  }
  return resolver;
};

/**
 * @param {string} filepath
 * @returns {boolean}
 */
const isApplicationFile = (filepath) => !filepath.split(path.sep).includes('node_modules');

/**
 * Resolves imports the way TypeScript does, honouring the `paths` of the tsconfig that includes the
 * importing file, extensionless specifiers, and `.js` specifiers naming a `.ts` file. A specifier that
 * resolves into `node_modules` is left to Node, so dependencies resolve exactly as they would without libnest.
 * @type {import('node:module').ResolveHook}
 */
export const resolve = async (specifier, context, nextResolve) => {
  if (context.parentURL?.startsWith('file:') && !isBuiltin(specifier)) {
    const { path: resolvedPath } = await getResolver(context.conditions).resolveFileAsync(
      fileURLToPath(context.parentURL),
      specifier
    );
    if (resolvedPath && isApplicationFile(resolvedPath)) {
      return { shortCircuit: true, url: pathToFileURL(resolvedPath).href };
    }
  }
  return nextResolve(specifier, context);
};

/** @type {import('node:module').LoadHook} */
export const load = async (url, context, nextLoad) => {
  const filename = url.startsWith('file:') ? fileURLToPath(url) : null;
  if (!filename?.endsWith('.ts')) {
    return nextLoad(url, context);
  }
  const { code } = await transform(await fs.readFile(filename, 'utf-8'), {
    ...SWC_OPTIONS,
    filename,
    sourceMaps: 'inline'
  });
  return { format: 'module', shortCircuit: true, source: code };
};
