import { renderToString } from 'react-dom/server';

import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as esbuild from 'esbuild';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';

import { RENDER_COMPONENT_METADATA_KEY } from '../decorators/render-component.decorator.js';

import type { RenderComponentOptions, RenderMethod } from '../decorators/render-component.decorator.js';

@Injectable()
export class RenderInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler() as RenderMethod;
    const response = context.switchToHttp().getResponse<Response>();
    const options = this.reflector.get<RenderComponentOptions>(RENDER_COMPONENT_METADATA_KEY, handler);

    const { default: Component } = (await import(options.filepath)) as {
      default: React.FC<{ [key: string]: unknown }>;
    };

    return next.handle().pipe(
      map(async (props: { [key: string]: unknown }) => {
        const script = await this.build(options.filepath, props);
        const html = renderToString(
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
