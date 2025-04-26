import { Injectable } from '@nestjs/common';

import { JSXService } from '../../src/index.js';

@Injectable()
export class UIService {
  constructor(private readonly jsxService: JSXService) {}

  async render(): Promise<string> {
    return this.jsxService.render(<h1>Hello World</h1>);
  }
}
