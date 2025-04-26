import type { JSX } from 'react';

import { Counter } from './Counter.js';

const Root = (): JSX.Element => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>Document</title>
      </head>
      <body>
        <Counter />
      </body>
    </html>
  );
};

export default Root;
