import * as path from 'node:path';

import { CommanderError } from 'commander';
import type { PartialDeep } from 'type-fest';
import { vi } from 'vitest';

const { args, process } = vi.hoisted(() => {
  const args = vi.fn<() => string[]>();
  const process = {
    get argv(): string[] {
      return ['node', 'main.js', ...args()];
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
    args,
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

  const exec = async (arguments_: string[]): Promise<CommanderError | undefined> => {
    args.mockReturnValue(arguments_);
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
