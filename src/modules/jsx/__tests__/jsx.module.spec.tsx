import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, it } from 'vitest';

import { JSXModule } from '../jsx.module.js';
import { JSXService } from '../jsx.service.js';

describe('JSXModule', () => {
  let jsxService: JSXService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JSXModule]
    }).compile();
    jsxService = moduleRef.get(JSXService);
  });

  describe('JSXService', () => {
    describe('renderToString', () => {
      it('should render JSX to a string', () => {
        expect(jsxService.renderToString(<h1>Hello World</h1>)).toBe('<h1>Hello World</h1>');
      });
    });
  });
});
