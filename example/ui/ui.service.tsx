import * as path from 'node:path';

import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

import { JSXService } from '../../src/index.js';

@Injectable()
export class UIService {
  constructor(private readonly jsxService: JSXService) {}

  async render(response: Response): Promise<Response> {
    return this.jsxService.render(response, path.resolve(import.meta.dirname, 'components/Root'));
  }
}
