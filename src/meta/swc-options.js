/**
 * The files SWC compiles, in development and in the production bundle alike. The bundle leaves every
 * other file to esbuild.
 */
export const SWC_FILTER = /\.(ts)$/;

/**
 * How those files are compiled. NestJS reads constructor dependencies from the `design:paramtypes`
 * metadata that legacy decorators emit, which type stripping alone never produces.
 * @type {import('@swc/core').Options}
 */
export const SWC_OPTIONS = {
  isModule: true,
  jsc: {
    experimental: {
      // SWC otherwise drops `with { type: 'json' }`, and Node refuses to import JSON without it
      keepImportAttributes: true
    },
    parser: {
      decorators: true,
      syntax: 'typescript'
    },
    target: 'esnext',
    transform: {
      decoratorMetadata: true,
      legacyDecorator: true
    }
  },
  module: {
    type: 'es6'
  }
};
