/**
 * How application TypeScript is compiled, in development and in the production bundle alike. NestJS
 * reads constructor dependencies from the `design:paramtypes` metadata that legacy decorators emit,
 * which type stripping alone never produces.
 * @type {import('@swc/core').Options}
 */
export const SWC_OPTIONS = {
  isModule: true,
  jsc: {
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
