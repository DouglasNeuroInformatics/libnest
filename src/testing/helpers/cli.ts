import * as path from 'node:path';

import { vi } from 'vitest';
import type { Mock } from 'vitest';

class MockProcessExitError extends Error {
  constructor(public exitCode: number) {
    super(`Process existed with code ${exitCode}`);
    this.name = MockProcessExitError.name;
  }
}

namespace CommandRunner {
  export type CreateOptions = {
    entry: string;
    root: string;
  };

  export type RunOptions = {
    cwd?: string;
    env?: {
      [key: string]: string;
    };
    ppid?: number;
  };

  export type RunResult = {
    error: null | {
      exitCode: number;
    };
    mocks: {
      process: {
        exit: Mock;
        kill: Mock;
        loadEnvFile: Mock;
      };
    };
    stderr: string;
    stdout: string;
  };
}

export class CommandRunner {
  private entry: string;
  private root: string;

  constructor(options: CommandRunner.CreateOptions) {
    this.entry = options.entry;
    this.root = options.root;
  }

  async run(args: string[], options: CommandRunner.RunOptions = {}): Promise<CommandRunner.RunResult> {
    let stderr = '';
    let stdout = '';

    vi.doMock('commander', async (importOriginal) => {
      const { Command: DefaultCommand, ...module } = await importOriginal<typeof import('commander')>();

      // Force to throw a CommanderError on exit and capture stdout/stderr
      class Command extends DefaultCommand {
        constructor(name: string) {
          super(name);
          this.configureOutput({
            writeErr: (err) => {
              stderr += err;
            },
            writeOut: (out) => {
              stdout += out;
            }
          });
          this.exitOverride();
        }
      }
      return {
        Command,
        ...module
      };
    });

    const process = {
      argv: ['node', this.entry, ...args],
      cwd: vi.fn(() => options.cwd ?? null),
      env: options.env ?? {},
      exit: vi.fn((exitCode: number) => {
        throw new MockProcessExitError(exitCode);
      }),
      kill: vi.fn(),
      loadEnvFile: vi.fn(),
      ppid: options.ppid ?? null
    };

    vi.doMock('process', () => process);

    const { CommanderError } = await vi.importActual<typeof import('commander')>('commander');

    try {
      await import(path.resolve(this.root, this.entry));
      return {
        error: null,
        mocks: {
          process
        },
        stderr,
        stdout
      };
    } catch (error) {
      if (error instanceof CommanderError || error instanceof MockProcessExitError) {
        return {
          error,
          mocks: {
            process
          },
          stderr,
          stdout
        };
      }
      throw error;
    } finally {
      vi.doUnmock('commander');
      vi.doUnmock('process');
      vi.resetModules();
    }
  }
}
