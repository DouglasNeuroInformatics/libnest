import { CommanderError } from 'commander';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

type CommandTestHelpers = {
  cmdArgs: Mock<() => string[]>;
  cmdStderr: Mock<(input: string) => void>;
  cmdStdout: Mock<(input: string) => void>;
  exec: (args: string[]) => Promise<CommanderError | undefined>;
};

export const setupCommandTest = (entry: string): CommandTestHelpers => {
  const cmdArgs = vi.fn<() => string[]>();
  const cmdStderr = vi.fn<(input: string) => void>();
  const cmdStdout = vi.fn<(input: string) => void>();

  vi.mock('node:process', () => ({
    get argv(): string[] {
      return ['node', 'libnest', ...cmdArgs()];
    }
  }));

  vi.mock('commander', async (importOriginal) => {
    const { Command: DefaultCommand, ...module } = await importOriginal<typeof import('commander')>();

    // Force to throw a CommanderError on exit and write stdout/stderr to mock functions
    class Command extends DefaultCommand {
      constructor(name: string) {
        super(name);
        this.configureOutput({
          writeErr: cmdStderr,
          writeOut: cmdStdout
        });
        this.exitOverride();
      }
    }

    return {
      Command,
      ...module
    };
  });

  /**
   * Executes the CLI command with the given arguments.
   * @param args - Command-line arguments
   * @returns A `CommanderError` if the command fails, otherwise `undefined`
   */
  const exec = async (args: string[]): Promise<CommanderError | undefined> => {
    cmdArgs.mockReturnValue(args);
    try {
      await import(entry);
    } catch (err) {
      if (err instanceof CommanderError) {
        return err;
      }
      throw err;
    }
    return;
  };

  return { cmdArgs, cmdStderr, cmdStdout, exec };
};
