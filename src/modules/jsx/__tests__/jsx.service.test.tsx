import * as path from 'node:path';
import { Writable } from 'node:stream';

import { Document, Window } from 'happy-dom';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { JSXService } from '../jsx.service.js';

describe('JSXService', () => {
  let jsxService: JSXService;

  let document: Document;
  let window: Window;

  beforeAll(() => {
    jsxService = new JSXService();
    window = new Window({
      innerHeight: 768,
      innerWidth: 1024,
      url: 'http://localhost:5500'
    });
    document = window.document;
  });

  afterAll(async () => {
    await window.happyDOM.close();
  });

  describe('render', () => {
    it('should render hello world', async () => {
      let data = '';
      const response = new Writable({
        write(chunk, _encoding, callback) {
          data += chunk.toString();
          callback();
        }
      });
      await jsxService.render(response, path.resolve(import.meta.dirname, 'components/Root.tsx'));
      document.write(data);
      expect(document.title).toBe('Counter');
    });
  });
});
