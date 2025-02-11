import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';

const require = module.createRequire(import.meta.url);

const { exports } = require('./package.json');

const entryPoints = Object.values(exports).map(({ import: importPath }) => {
  const match = importPath.match(/^.\/dist\/(.*)\.js$/);
  if (!match) {
    throw new Error(`Unexpected format for import path in package.json: ${importPath}`);
  }
  const srcPath = path.resolve(import.meta.dirname, `src/${match[1]}.ts`);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`File does not exist: ${srcPath}`);
  }
  return srcPath;
});

/** @type {Partial<import("typedoc").TypeDocOptions>} */
export default {
  cleanOutputDir: true,
  entryPoints,
  out: path.resolve(import.meta.dirname, 'docs'),
  plugin: ['typedoc-material-theme', 'typedoc-plugin-zod']
};
