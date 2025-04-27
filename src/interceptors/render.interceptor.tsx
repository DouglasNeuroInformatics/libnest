import { renderToPipeableStream } from 'react-dom/server';

import { Injectable } from '@nestjs/common';
import type { ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as esbuild from 'esbuild';
import type { Response } from 'express';
import { Observable } from 'rxjs';

import { RENDER_COMPONENT_METADATA_KEY } from '../decorators/render-component.decorator.js';

import type { RenderComponentOptions, RenderMethod } from '../decorators/render-component.decorator.js';

@Injectable()
export class RenderInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  async intercept(context: ExecutionContext): Promise<Observable<any>> {
    const handler = context.getHandler() as RenderMethod;
    const props = handler();

    const options = this.reflector.get<RenderComponentOptions>(RENDER_COMPONENT_METADATA_KEY, handler);
    const { default: Root } = (await import(options.filepath)) as { default: React.ComponentType };
    const bootstrapScriptContent = await this.build(options.filepath, props);
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('content-type', 'text/html');

    return new Observable<void>((subscriber) => {
      const { pipe } = renderToPipeableStream(<Root />, {
        bootstrapScriptContent: bootstrapScriptContent,
        onAllReady() {
          pipe(response);
          subscriber.complete();
        }
      });
      subscriber.next();
    });
  }

  private async build(filepath: string, props: { [key: string]: unknown }): Promise<string> {
    const result = await esbuild.build({
      bundle: true,
      define: {
        __ROOT_PROPS: JSON.stringify(props)
      },
      format: 'esm',
      jsx: 'automatic',
      minify: true,
      platform: 'browser',
      stdin: {
        contents: [
          "import { hydrateRoot } from 'react-dom/client';",
          `import Root from '${filepath}';`,
          'hydrateRoot(document, <Root {...__ROOT_PROPS} />);'
        ].join('\n'),
        loader: 'tsx',
        resolveDir: import.meta.dirname
      },
      target: 'es2022',
      write: false
    });
    return result.outputFiles.find((output) => output.path === '<stdout>')!.text;
  }
}
