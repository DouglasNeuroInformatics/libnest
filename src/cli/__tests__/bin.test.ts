import { CommanderError } from 'commander';
import { err, errAsync, ok, okAsync } from 'neverthrow';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { cmdArgs, cmdStderr, cmdStdout, resolveAbsoluteImportPath, runDev } = vi.hoisted(() => ({
  cmdArgs: vi.fn(),
  cmdStderr: vi.fn(),
  cmdStdout: vi.fn(),
  resolveAbsoluteImportPath: vi.fn(),
  runDev: vi.fn()
}));

vi.mock('node:process', () => ({
  get argv() {
    return ['node', 'bin.js', ...cmdArgs()];
  }
}));

vi.mock('./lib.js', () => ({
  resolveAbsoluteImportPath,
  runDev
}));

vi.mock('commander', async (importOriginal) => {
  const { Command: _Command, ...module } = await importOriginal<typeof import('commander')>();

  class Command extends _Command {
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

describe('bin.js', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('libnest --help', () => {
    it('should output help', async () => {
      const result = await exec(['--help']);
      expect(result).toMatchObject({ exitCode: 0 });
      expect(cmdStdout).toHaveBeenCalledWith(expect.stringContaining('Usage: @douglasneuroinformatics/libnest'));
    });
  });

  describe('libnest dev', () => {
    it('should throw an InvalidArgumentError if the config path cannot be resolved', async () => {
      resolveAbsoluteImportPath.mockReturnValueOnce(err('Failed'));
      const result = await exec(['dev', '-c', 'libnest.config.ts']);
      expect(resolveAbsoluteImportPath).toHaveBeenLastCalledWith('libnest.config.ts');
      expect(result).toMatchObject({ code: 'commander.invalidArgument', exitCode: 1 });
    });
    it('should call runDev if the config path cannot be resolved', async () => {
      resolveAbsoluteImportPath.mockReturnValueOnce(ok('/root/libnest.config.ts'));
      runDev.mockReturnValueOnce(okAsync(undefined));
      await exec(['dev', '-c', 'libnest.config.ts']);
      expect(runDev).toHaveBeenCalled();
    });
    it('should exit with exit code 1 if runDev returns an error', async () => {
      resolveAbsoluteImportPath.mockReturnValueOnce(ok('/root/libnest.config.ts'));
      runDev.mockReturnValueOnce(errAsync('Error!'));
      const result = await exec(['dev', '-c', 'libnest.config.ts']);
      expect(result).toMatchObject({ exitCode: 1 });
    });
  });
});
