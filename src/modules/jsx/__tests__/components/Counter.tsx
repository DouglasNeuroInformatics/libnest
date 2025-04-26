import React, { useState } from 'react';

export const Counter: React.FC<{}> = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Current Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  );
};
