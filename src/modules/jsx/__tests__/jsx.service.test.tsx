import { beforeAll, describe, expect, it } from 'vitest';

import { JSXService } from '../jsx.service.js';

describe('JSXService', () => {
  let jsxService: JSXService;

  beforeAll(() => {
    jsxService = new JSXService();
  });

  describe('render', () => {
    it('should render hello world', async () => {
      await expect(jsxService.render(<h1>Hello World</h1>)).resolves.toBe('<h1>Hello World</h1>');
    });
  });
});
