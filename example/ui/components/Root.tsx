import type { JSX } from 'react';

export const Root = (): JSX.Element => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>Document</title>
      </head>
      <body>
        <div id="root" />
      </body>
    </html>
  );
};
