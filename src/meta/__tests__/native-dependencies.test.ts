import { describe, expect, it, vi } from 'vitest';

import {
  KNOWN_NATIVE_DEPENDENCIES,
  KNOWN_NATIVE_DEPENDENCY_NAMES,
  resolveNativeDependency
} from '../native-dependencies.js';

import type { NativeDependency } from '../../user-config.js';

describe('resolveNativeDependency', () => {
  it('should expand a known name to its built-in recipe', () => {
    expect(resolveNativeDependency('esbuild')).toBe(KNOWN_NATIVE_DEPENDENCIES.esbuild);
  });

  it('should pass a custom dependency through unchanged', () => {
    const custom: NativeDependency = {
      locate: () => '/artifact',
      outputName: 'artifact',
      packageName: 'custom',
      runtimeEnvVar: 'CUSTOM_BINARY_PATH'
    };
    expect(resolveNativeDependency(custom)).toBe(custom);
  });
});

describe('KNOWN_NATIVE_DEPENDENCY_NAMES', () => {
  it('should list every built-in recipe, so the config validator accepts each one', () => {
    expect(KNOWN_NATIVE_DEPENDENCY_NAMES).toStrictEqual(Object.keys(KNOWN_NATIVE_DEPENDENCIES));
  });
});

describe('esbuild recipe', () => {
  it('should resolve the executable of the platform package for the current host', () => {
    const resolve = vi.fn().mockReturnValue('/pkgs/@esbuild/target/bin/esbuild');

    const artifact = KNOWN_NATIVE_DEPENDENCIES.esbuild.locate({
      entryPath: '/pkgs/esbuild/lib/main.js',
      require: { resolve } as any
    });

    expect(resolve).toHaveBeenCalledWith(`@esbuild/${process.platform}-${process.arch}/bin/esbuild`);
    expect(artifact).toBe('/pkgs/@esbuild/target/bin/esbuild');
  });
});
