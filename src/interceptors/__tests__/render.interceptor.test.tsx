import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { MockFactory } from '../../testing/index.js';
import { RenderInterceptor } from '../render.interceptor.js';

import type { RenderComponentOptions } from '../../decorators/render-component.decorator.js';
import type { MockedInstance } from '../../testing/index.js';

const esbuild = {
  build: vi.fn()
};

vi.doMock('esbuild', () => esbuild);

const rxjs = vi.hoisted(() => ({
  map: vi.fn()
}));

vi.mock('rxjs', () => rxjs);

describe('RenderInterceptor', () => {
  describe('constructor', () => {
    it('should throw if the the options have not been configured', () => {
      expect(() => new RenderInterceptor(undefined, new Reflector())).toThrow(
        'Cannot use RenderInterceptor without configuring jsx options: this should be configured in the AppFactory'
      );
    });
  });
  describe('intercept', () => {
    const httpAdapter: MockedInstance<HttpAdapterHost> = {
      getRequest: vi.fn(),
      getResponse: vi.fn().mockReturnValue({
        setHeader: vi.fn()
      })
    };
    const context: MockedInstance<ExecutionContext> = {
      getArgByIndex: vi.fn(),
      getArgs: vi.fn(),
      getClass: vi.fn(),
      getHandler: vi.fn(),
      getType: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue(httpAdapter),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn()
    };
    const next: MockedInstance<CallHandler> = {
      handle: vi.fn()
    };
    const reflector: MockedInstance<Reflector> = MockFactory.createMock(Reflector);

    const importHello = vi.fn();

    const renderInterceptor = new RenderInterceptor(
      {
        baseDir: '/',
        importMap: {
          hello: importHello
        }
      },
      reflector
    );

    it('should throw an internal server error if the component does not exist in the import map', async () => {
      reflector.get.mockReturnValueOnce({ name: 'foo' } satisfies RenderComponentOptions);
      await expect(renderInterceptor.intercept(context, next)).rejects.toMatchObject({
        cause: {
          message: "Cannot load component 'foo' from provided import keys: hello"
        },
        message: 'Failed to Render Page',
        name: 'InternalServerErrorException'
      });
    });

    it('should throw an internal server error if it cannot import the component', async () => {
      reflector.get.mockReturnValueOnce({ name: 'hello' } satisfies RenderComponentOptions);
      importHello.mockImplementationOnce(() => {
        throw new Error('Import failed!');
      });
      await expect(renderInterceptor.intercept(context, next)).rejects.toMatchObject({
        cause: {
          message: 'Import failed!'
        },
        message: 'Failed to Render Page',
        name: 'InternalServerErrorException'
      });
    });

    it('should throw an internal server error if the default export from the requested file is not a function', async () => {
      reflector.get.mockReturnValueOnce({ name: 'hello' } satisfies RenderComponentOptions);
      importHello.mockReturnValueOnce({ default: undefined });
      await expect(renderInterceptor.intercept(context, next)).rejects.toMatchObject({
        cause: {
          message: "Expected default export for component 'hello' to be type 'function', got 'undefined'"
        },
        message: 'Failed to Render Page',
        name: 'InternalServerErrorException'
      });
    });

    it('should call the handler', async () => {
      esbuild.build.mockResolvedValueOnce({
        outputFiles: [
          {
            path: '<stdout>',
            text: 'console.log("hello world");'
          }
        ]
      });
      reflector.get.mockReturnValueOnce({ name: 'hello' } satisfies RenderComponentOptions);
      importHello.mockResolvedValueOnce({ default: ({ name }: { name: string }) => <h1>{`Hello, ${name}`}</h1> });
      next.handle.mockReturnValueOnce({ pipe: vi.fn() });
      await expect(renderInterceptor.intercept(context, next)).resolves.not.toThrow();
      expect(next.handle).toHaveBeenCalledOnce();
      expect(rxjs.map).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
      const mapProps = rxjs.map.mock.lastCall![0]!;
      const html = await mapProps({ name: 'Winston' });
      expect(html).toContain('<h1>Hello, Winston</h1>');
    });
  });
});
