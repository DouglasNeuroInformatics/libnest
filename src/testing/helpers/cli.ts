import * as path from 'node:path';

import { CommanderError } from 'commander';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

type CommandTestOptions = {
  entry: string;
  root: string;
};

type CommandMocks = {
  args: Mock<() => string[]>;
  stderr: Mock<(input: string) => void>;
  stdout: Mock<(input: string) => void>;
};

type CommandTestHelpers = CommandMocks & {
  exec: (args: string[]) => Promise<CommanderError | undefined>;
};

const cmd: CommandMocks = vi.hoisted(() => ({
  args: vi.fn<() => string[]>(),
  stderr: vi.fn<(input: string) => void>(),
  stdout: vi.fn<(input: string) => void>()
}));

export const setupCommandTest = ({ entry, root }: CommandTestOptions): CommandTestHelpers => {
  vi.mock('node:process', () => ({
    get argv(): string[] {
      return ['node', 'libnest', ...cmd.args()];
    }
  }));

  vi.mock('commander', async (importOriginal) => {
    const { Command: DefaultCommand, ...module } = await importOriginal<typeof import('commander')>();

    // Force to throw a CommanderError on exit and write stdout/stderr to mock functions
    class Command extends DefaultCommand {
      constructor(name: string) {
        super(name);
        this.configureOutput({
          writeErr: cmd.stderr,
          writeOut: cmd.stdout
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
    cmd.args.mockReturnValue(args);
    try {
      await import(path.resolve(root, entry));
    } catch (err) {
      if (err instanceof CommanderError) {
        return err;
      }
      throw err;
    }
    return;
  };

  return { ...cmd, exec };
};
