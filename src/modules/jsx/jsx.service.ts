import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

import { Injectable } from '@nestjs/common';

@Injectable()
export class JSXService {
  render(element: ReactNode): Promise<string> {
    const html = renderToString(element);
    return Promise.resolve(html);
  }
}
