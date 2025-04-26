import { useState } from 'react';
import type { JSX } from 'react';

export const Counter = (): JSX.Element => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Current Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  );
};
