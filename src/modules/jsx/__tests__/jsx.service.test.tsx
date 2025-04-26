import * as path from 'node:path';
import { Writable } from 'node:stream';

import { Document, HTMLElement, Window } from 'happy-dom';
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
    document = window.document as any;
  });

  afterAll(async () => {
    await window.happyDOM.close();
  });

  describe('render', () => {
    it('should successfully pipe the generated html to the response', async () => {
      let data = '';
      const response = new Writable({
        write(chunk, _encoding, callback) {
          data += chunk.toString();
          callback();
        }
      });
      await jsxService.render(response, path.resolve(import.meta.dirname, 'components/Root.tsx'));
      document.write(data);
      await window.happyDOM.waitUntilComplete();
    });

    it('should generate the correct html', async () => {
      const counterHeading = document.getElementById('counter-heading') as HTMLElement;
      const counterButton = document.getElementById('counter-button') as HTMLElement;
      expect(counterHeading).toBeDefined();
      expect(counterButton).toBeDefined();
      expect(counterHeading.innerText).toBe('Current Count: 0');
      counterButton.click();
      await window.happyDOM.waitUntilComplete();
      expect(counterHeading.innerText).toBe('Current Count: 1');
    });
  });
});
