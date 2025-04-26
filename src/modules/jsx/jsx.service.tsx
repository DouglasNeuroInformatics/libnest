import { renderToPipeableStream } from 'react-dom/server';

import { Injectable } from '@nestjs/common';
import * as esbuild from 'esbuild';
import type { Response } from 'express';

@Injectable()
export class JSXService {
  async render(response: Response, filepath: string): Promise<Response> {
    const { default: Root } = (await import(filepath)) as { default: React.ComponentType };
    const bootstrapScriptContent = await this.build(filepath);
    return new Promise((resolve) => {
      const { pipe } = renderToPipeableStream(<Root />, {
        bootstrapScriptContent: bootstrapScriptContent,
        onShellReady() {
          response.setHeader('content-type', 'text/html');
          resolve(pipe(response));
        }
      });
    });
  }

  private async build(filepath: string): Promise<string> {
    const result = await esbuild.build({
      bundle: true,
      format: 'esm',
      jsx: 'automatic',
      platform: 'browser',
      stdin: {
        contents: [
          "import { hydrateRoot } from 'react-dom/client';",
          `import Root from '${filepath}';`,
          'hydrateRoot(document, <Root />);'
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
