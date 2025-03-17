#!/usr/bin/env node

/**
 * The purpose of this file structure is to force commander to
 * use the shebang, which is necessary to provide flags to Node. If
 * the files do not have an extension, TypeScript won't check them, while
 * if they have an extension, Commander executes them with Node to accommodate
 * Windows users.
 */

import * as module from 'node:module';
import * as process from 'node:process';

import { Command } from 'commander';

const require = module.createRequire(import.meta.url);

/** @type {{ name: string; version: string }} */
const { name, version } = require('../../package.json');

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);
program.allowUnknownOption(false);

program.command('build', 'build application for production');
program.command('dev', 'run application in development mode');

await program.parseAsync(process.argv);
