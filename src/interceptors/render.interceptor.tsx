import { renderToString } from 'react-dom/server';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { RENDER_COMPONENT_METADATA_KEY } from '../decorators/render-component.decorator.js';

import type { RenderComponentOptions, RenderMethod } from '../decorators/render-component.decorator.js';

@Injectable()
export class RenderInterceptor implements NestInterceptor {
  private esbuild: null | typeof import('esbuild') = null;

  constructor(private readonly reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler() as RenderMethod;
    const response = context.switchToHttp().getResponse<Response>();
    const { filepath } = this.reflector.get<RenderComponentOptions>(RENDER_COMPONENT_METADATA_KEY, handler);

    let Component: React.FC<{ [key: string]: unknown }>;
    try {
      const module = (await import(filepath)) as { [key: string]: unknown };
      if (typeof module.default !== 'function') {
        throw new Error(
          `Expected default export from file '${filepath}' to be type 'function', got '${typeof module.default}'`
        );
      }
      Component = module.default as React.FC<{ [key: string]: unknown }>;
    } catch (error) {
      throw new InternalServerErrorException('Failed to Render Page', { cause: error });
    }

    return next.handle().pipe(
      map(async (props: { [key: string]: unknown }) => {
        const script = await this.generateBootstrapScript(filepath, props);
        let html = '<!DOCTYPE html>\n';
        html += renderToString(
          <html lang="en">
            <head>
              <meta charSet="UTF-8" />
              <meta content="width=device-width, initial-scale=1.0" name="viewport" />
              <title>Page</title>
            </head>
            <body>
              <div id="root">
                <Component {...props} />
              </div>
            </body>
            <script dangerouslySetInnerHTML={{ __html: script }} />
          </html>
        );
        response.setHeader('content-type', 'text/html');
        return html;
      })
    );
  }

  private async generateBootstrapScript(filepath: string, props: { [key: string]: unknown }): Promise<string> {
    this.esbuild ??= await import('esbuild');
    const result = await this.esbuild.build({
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
          `const root = document.getElementById('root');`,
          'hydrateRoot(root, <Root {...__ROOT_PROPS} />);'
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
