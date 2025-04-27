import { renderToString } from 'react-dom/server';

import { Inject, Injectable, InternalServerErrorException, Optional } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { RENDER_COMPONENT_METADATA_KEY } from '../decorators/render-component.decorator.js';
import { defineToken } from '../utils/token.utils.js';

import type { RenderComponentOptions, RenderMethod } from '../decorators/render-component.decorator.js';

export type JSXOptions = {
  baseDir: string;
  importMap: {
    [key: string]: () => Promise<{ [key: string]: any }>;
  };
};

export const { JSX_OPTIONS_TOKEN } = defineToken('JSX_OPTIONS_TOKEN');

@Injectable()
export class RenderInterceptor implements NestInterceptor {
  private esbuild: null | typeof import('esbuild') = null;
  private readonly importKeys: string[];
  private readonly options: JSXOptions;

  constructor(
    @Inject(JSX_OPTIONS_TOKEN) @Optional() options: JSXOptions | undefined,
    private readonly reflector: Reflector
  ) {
    if (!options) {
      throw new Error(
        'Cannot use RenderInterceptor without configuring jsx options: this should be configured in the AppFactory'
      );
    }
    this.importKeys = Object.keys(options.importMap);
    this.options = options;
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler() as RenderMethod;
    const response = context.switchToHttp().getResponse<Response>();
    const { name } = this.reflector.get<RenderComponentOptions>(RENDER_COMPONENT_METADATA_KEY, handler);

    let Component: React.FC<{ [key: string]: unknown }>;
    try {
      const load = this.options.importMap[name];
      if (!load) {
        throw new Error(`Cannot load component '${name}' from provided import keys: ${this.importKeys.join(', ')}`);
      }
      const module = await load();
      if (typeof module.default !== 'function') {
        throw new Error(
          `Expected default export for component '${name}' to be type 'function', got '${typeof module.default}'`
        );
      }
      Component = module.default as React.FC<{ [key: string]: unknown }>;
    } catch (error) {
      throw new InternalServerErrorException('Failed to Render Page', { cause: error });
    }

    return next.handle().pipe(
      map(async (props: { [key: string]: unknown }) => {
        const script = await this.generateBootstrapScript(name, props);
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
            <script dangerouslySetInnerHTML={{ __html: script }} type="module" />
          </html>
        );
        response.setHeader('content-type', 'text/html');
        return html;
      })
    );
  }

  private async generateBootstrapScript(name: string, props: { [key: string]: unknown }): Promise<string> {
    this.esbuild ??= await import('esbuild');
    const importFn = this.options.importMap[name]!;
    const result = await this.esbuild.build({
      bundle: true,
      define: {
        __LIBNEST_PROPS: JSON.stringify(props)
      },
      format: 'esm',
      jsx: 'automatic',
      minify: false,
      platform: 'browser',
      stdin: {
        contents: [
          "import { hydrateRoot } from 'react-dom/client';",
          `const __LIBNEST_IMPORT = ${importFn.toString()};`,
          `const __LIBNEST_APP = (await __LIBNEST_IMPORT()).default;`,
          'hydrateRoot(document.getElementById("root"), <__LIBNEST_APP {...__LIBNEST_PROPS} />);'
        ].join('\n'),
        loader: 'tsx',
        resolveDir: this.options.baseDir
      },
      target: 'es2022',
      write: false
    });
    return result.outputFiles.find((output) => output.path === '<stdout>')!.text;
  }
}
