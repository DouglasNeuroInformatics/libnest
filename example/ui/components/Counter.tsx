import { useState } from 'react';
import type { JSX } from 'react';

const Counter: React.FC<{ initialCount: number }> = ({ initialCount }): JSX.Element => {
  const [count, setCount] = useState(initialCount);
  return (
    <div>
      <h1>Current Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  );
};

export default Counter;
