import * as path from 'node:path';
import { Writable } from 'node:stream';

import { InternalServerErrorException } from '@nestjs/common';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { Document, HTMLElement, Window } from 'happy-dom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { MockFactory } from '../../testing/index.js';
import { RenderInterceptor } from '../render.interceptor.js';

import type { RenderComponentOptions } from '../../decorators/render-component.decorator.js';
import type { MockedInstance } from '../../testing/index.js';

describe('RenderInterceptor', () => {
  const httpAdapter: MockedInstance<HttpAdapterHost> = {
    getRequest: vi.fn(),
    getResponse: vi.fn()
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

  const renderInterceptor = new RenderInterceptor(reflector);

  let document: Document;
  let window: Window;

  beforeAll(() => {
    window = new Window({
      innerHeight: 768,
      innerWidth: 1024,
      url: 'http://localhost:5500'
    });
    document = window.document as any;
  });

  afterAll(async () => {
    await window.happyDOM.close();
  });

  describe('intercept', () => {
    it('should throw an internal server error if it cannot import the component', async () => {
      reflector.get.mockReturnValueOnce({ filepath: '/foo/bar.jsx' } satisfies RenderComponentOptions);
      await expect(renderInterceptor.intercept(context, next)).rejects.toMatchObject({
        cause: {
          message: expect.stringMatching(/^Failed to load url \/foo\/bar.jsx/)
        },
        message: 'Failed to Render Page',
        name: 'InternalServerErrorException'
      });
    });
    it('should throw an internal server error if the default export from the requested file is not a function', async () => {
      reflector.get.mockReturnValueOnce({ filepath: '/foo/bar.jsx' } satisfies RenderComponentOptions);
      vi.doMock('/foo/bar.jsx', () => ({ default: undefined }));
      await expect(renderInterceptor.intercept(context, next)).rejects.toMatchObject({
        cause: {
          message: "Expected default export from file '/foo/bar.jsx' to be type 'function', got 'undefined'"
        },
        message: 'Failed to Render Page',
        name: 'InternalServerErrorException'
      });
    });
  });

  // describe('render', () => {
  //   it('should successfully pipe the generated html to the response', async () => {
  //     let data = '';
  //     const response = new Writable({
  //       write(chunk, _encoding, callback) {
  //         data += chunk.toString();
  //         callback();
  //       }
  //     });
  //     await jsxService.render(response, path.resolve(import.meta.dirname, 'components/Root.tsx'));
  //     document.write(data);
  //     await window.happyDOM.waitUntilComplete();
  //   });

  //   it('should generate the correct html', async () => {
  //     const counterHeading = document.getElementById('counter-heading') as HTMLElement;
  //     const counterButton = document.getElementById('counter-button') as HTMLElement;
  //     expect(counterHeading).toBeDefined();
  //     expect(counterButton).toBeDefined();
  //     expect(counterHeading.innerText).toBe('Current Count: 0');
  //     counterButton.click();
  //     await window.happyDOM.waitUntilComplete();
  //     expect(counterHeading.innerText).toBe('Current Count: 1');
  //   });
  // });
});
