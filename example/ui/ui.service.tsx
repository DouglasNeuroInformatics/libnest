import { useState } from 'react';
import type { JSX } from 'react';

import { Injectable } from '@nestjs/common';

import { JSXService } from '../../src/index.js';

const UI = (): JSX.Element => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Current Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  );
};

@Injectable()
export class UIService {
  constructor(private readonly jsxService: JSXService) {}

  async render(): Promise<string> {
    return this.jsxService.render(<UI />);
  }
}
