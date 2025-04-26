import { Counter } from './Counter.js';

export const Root: React.FC<{}> = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>Counter</title>
      </head>
      <body>
        <Counter />
      </body>
    </html>
  );
};

export default Root;
