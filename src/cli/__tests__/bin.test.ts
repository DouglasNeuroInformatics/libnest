import { CommanderError } from 'commander';
import { describe, expect, it, vi } from 'vitest';

const { cmdArgs, cmdStderr, cmdStdout } = vi.hoisted(() => ({
  cmdArgs: vi.fn(),
  cmdStderr: vi.fn(),
  cmdStdout: vi.fn()
}));

vi.mock('node:process', () => ({
  get argv() {
    return ['node', 'libnest', ...cmdArgs()];
  }
}));

vi.mock('commander', async (importOriginal) => {
  const { Command: DefaultCommand, ...module } = await importOriginal<typeof import('commander')>();

  class Command extends DefaultCommand {
    constructor(name: string) {
      super(name);
      this.configureOutput({
        writeErr: cmdStderr,
        writeOut: cmdStdout
      });
      // this will force Commander to throw a CommanderError on exit
      this.exitOverride();
    }
  }

  return {
    Command,
    ...module
  };
});

const exec = async (args: string[]) => {
  cmdArgs.mockReturnValue(args);
  try {
    await import('../bin.js');
  } catch (err) {
    if (err instanceof CommanderError) {
      return err;
    }
    throw err;
  }
  return;
};

describe('libnest', () => {
  it('should output help', async () => {
    const result = await exec(['--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(cmdStdout).toHaveBeenCalledWith(expect.stringContaining('Usage: @douglasneuroinformatics/libnest'));
  });
});
