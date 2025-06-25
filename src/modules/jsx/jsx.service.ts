import type ReactDOMServer from 'react-dom/server';

import { Inject, Injectable } from '@nestjs/common';

import { REACT_DOM_SERVER_TOKEN } from './jsx.config.js';

@Injectable()
export class JSXService {
  public renderToString: (typeof ReactDOMServer)['renderToString'];

  constructor(@Inject(REACT_DOM_SERVER_TOKEN) ReactDOM: typeof ReactDOMServer) {
    this.renderToString = ReactDOM.renderToString;
  }
}
