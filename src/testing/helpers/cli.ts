import * as path from 'node:path';

import { isPlainObject } from '@douglasneuroinformatics/libjs';
import { CommanderError } from 'commander';
import { vi } from 'vitest';

type ProcessExitTestResult = {
  exitCode: number;
};

const isProcessExitTestResult = (arg: unknown): arg is ProcessExitTestResult => {
  return isPlainObject(arg) && typeof arg.exitCode === 'number';
};

const { getArgv, process } = vi.hoisted(() => {
  const getArgv = vi.fn<() => string[]>();
  const process = {
    get argv(): string[] {
      return getArgv();
    },
    cwd: vi.fn(),
    env: {
      LIBNEST_CONFIG_FILEPATH: vi.fn()
    },
    exit: vi.fn((exitCode: number) => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { exitCode } satisfies ProcessExitTestResult;
    }),
    kill: vi.fn(),
    loadEnvFile: vi.fn(),
    ppid: undefined,
    stderr: {
      write: vi.fn()
    },
    stdout: {
      write: vi.fn()
    }
  };

  return {
    getArgv,
    process
  };
});

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

function createExec(options: { entry: string; root: string }) {
  return async (args: string[]): Promise<CommanderError | ProcessExitTestResult | undefined> => {
    getArgv.mockReturnValueOnce(['node', options.entry, ...args]);
    try {
      await import(path.resolve(options.root, options.entry));
    } catch (err) {
      if (err instanceof CommanderError || isProcessExitTestResult(err)) {
        return err;
      }
      throw err;
    } finally {
      vi.resetModules();
    }
    return;
  };
}

export { createExec, process };
export type { ProcessExitTestResult };
