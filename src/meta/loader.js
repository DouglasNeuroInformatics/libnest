import * as fs from 'node:fs';
import { isBuiltin } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { transform } from '@swc/core';
import { ResolverFactory } from 'oxc-resolver';

import { SWC_FILTER, SWC_OPTIONS } from './swc-options.js';

/**
 * The extensions the production bundle leaves to esbuild that Node cannot load itself. `.cts` is not
 * among them: Node strips its types, which is all @swc-node/register ever had it do.
 */
const ESBUILD_FILTER = /\.(jsx|mts|tsx)$/;

/** Specifiers that already name what to load, which @swc-node/register also passed through unresolved. */
const URL_SPECIFIER = /^(data|file):/;

/**
 * The tsconfig whose `paths` apply to every application file. It is the one @swc-node/register read,
 * found the same way, so an application that set `SWC_NODE_PROJECT` or `TS_NODE_PROJECT` for it keeps
 * its aliases.
 * @returns {string | undefined}
 */
const findProjectTsconfig = () => {
  const configured = process.env.SWC_NODE_PROJECT ?? process.env.TS_NODE_PROJECT;
  if (configured) {
    return path.resolve(process.cwd(), configured);
  }
  const conventional = path.resolve(process.cwd(), 'tsconfig.json');
  return fs.existsSync(conventional) ? conventional : undefined;
};

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
    const configFile = findProjectTsconfig();
    resolver = new ResolverFactory({
      conditionNames: conditions,
      extensionAlias: {
        '.cjs': ['.cts', '.cjs'],
        '.js': ['.ts', '.tsx', '.js'],
        '.mjs': ['.mts', '.mjs']
      },
      extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.json', '.wasm', '.node'],
      ...(configFile && { tsconfig: { configFile, references: 'auto' } })
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
 * Splits off the `?query` and `#fragment` of a specifier, which name a module instance rather than a
 * file. The first character is never a delimiter, as a leading `#` marks a package import.
 * @param {string} specifier
 * @returns {{ request: string, suffix: string }}
 */
const splitSpecifier = (specifier) => {
  const index = specifier.slice(1).search(/[?#]/) + 1;
  return index
    ? { request: specifier.slice(0, index), suffix: specifier.slice(index) }
    : { request: specifier, suffix: '' };
};

/**
 * @param {string} filename
 * @returns {Promise<string>}
 */
const compileWithSwc = async (filename) => {
  const { code } = await transform(await fs.promises.readFile(filename, 'utf-8'), {
    ...SWC_OPTIONS,
    filename,
    sourceMaps: 'inline'
  });
  return code;
};

/**
 * @param {string} filename
 * @returns {Promise<string>}
 */
const compileWithEsbuild = async (filename) => {
  const { build } = await import('esbuild');
  const result = await build({
    entryPoints: [filename],
    format: 'esm',
    logLevel: 'silent',
    // esbuild writes source paths relative to the output directory, and Node reads them relative to the module
    outdir: path.dirname(filename),
    platform: 'node',
    sourcemap: 'inline',
    target: `node${process.versions.node}`,
    write: false
  });
  // esbuild emits one file for one entry point that is neither bundled nor split, as the map is inline
  const [output] = /** @type {[import('esbuild').OutputFile]} */ (result.outputFiles);
  return output.text;
};

/**
 * @param {string} filename
 * @returns {((filename: string) => Promise<string>) | null}
 */
const findCompiler = (filename) => {
  if (SWC_FILTER.test(filename)) {
    return compileWithSwc;
  }
  return ESBUILD_FILTER.test(filename) ? compileWithEsbuild : null;
};

/**
 * Resolves imports the way TypeScript does, honouring the `paths` of the project tsconfig,
 * extensionless specifiers, and `.js` specifiers naming a `.ts` file. A specifier that resolves into
 * `node_modules` is left to Node, so dependencies resolve exactly as they would without libnest.
 * @type {import('node:module').ResolveHook}
 */
export const resolve = async (specifier, context, nextResolve) => {
  if (!context.parentURL?.startsWith('file:') || isBuiltin(specifier) || URL_SPECIFIER.test(specifier)) {
    return nextResolve(specifier, context);
  }
  const importer = fileURLToPath(context.parentURL);
  const { request, suffix } = splitSpecifier(specifier);
  const resolution = await getResolver(context.conditions).async(path.dirname(importer), request);
  if (resolution.path && isApplicationFile(resolution.path)) {
    return { shortCircuit: true, url: pathToFileURL(resolution.path).href + suffix };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (cause) {
    // Node can only say the specifier is missing. The resolver also says when the tsconfig that should
    // have resolved it cannot be read. A dependency probing for an optional package expects Node's error.
    if (resolution.error && isApplicationFile(importer)) {
      throw new Error(`${resolution.error}: '${specifier}' cannot be resolved from ${importer}`, { cause });
    }
    throw cause;
  }
};

/**
 * Compiles each file with the compiler, and the options, the production bundle uses for it.
 * @type {import('node:module').LoadHook}
 */
export const load = async (url, context, nextLoad) => {
  const filename = url.startsWith('file:') ? fileURLToPath(url) : '';
  const compile = findCompiler(filename);
  if (!compile) {
    return nextLoad(url, context);
  }
  return { format: 'module', shortCircuit: true, source: await compile(filename) };
};
