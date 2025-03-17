import * as path from 'node:path';

import { CommanderError } from 'commander';
import type { PartialDeep } from 'type-fest';
import { vi } from 'vitest';

const { getArgv, process } = vi.hoisted(() => {
  const getArgv = vi.fn<() => string[]>();
  const process = {
    get argv(): string[] {
      return getArgv();
    },
    kill: vi.fn(),
    stderr: {
      write: vi.fn()
    },
    stdout: {
      write: vi.fn()
    }
  } satisfies PartialDeep<NodeJS.Process>;
  return {
    getArgv,
    process
  };
});

export function setupCommandTest(options: { entry: string; root: string }) {
  vi.mock('node:process', () => process);

  vi.mock('commander', async (importOriginal) => {
    const { Command: DefaultCommand, ...module } = await importOriginal<typeof import('commander')>();

    // Force to throw a CommanderError on exit and write stdout/stderr to mock functions
    class Command extends DefaultCommand {
      constructor(name: string) {
        super(name);
        this.configureOutput({
          writeErr: process.stderr.write,
          writeOut: process.stdout.write
        });
        this.exitOverride();
      }
    }
    return {
      Command,
      ...module
    };
  });

  const exec = async (args: string[]): Promise<CommanderError | undefined> => {
    getArgv.mockReturnValueOnce(['node', options.entry, ...args]);
    try {
      await import(path.resolve(options.root, options.entry));
    } catch (err) {
      if (err instanceof CommanderError) {
        return err;
      }
      throw err;
    }
    return;
  };

  return { exec, process };
}
