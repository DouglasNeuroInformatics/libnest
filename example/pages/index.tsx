import { useState } from 'react';
import type { JSX } from 'react';

import type { Cat } from '../cats/schemas/cat.schema.js';

type CatsProps = {
  cats: Cat[];
};

const Cats: React.FC<CatsProps> = ({ cats }): JSX.Element => {
  const [isListOpen, setIsListOpen] = useState(false);
  return (
    <div style={{ margin: 'auto', maxWidth: '1200px', padding: '8px 24px' }}>
      <h1 style={{ textAlign: 'center' }}>Welcome to the Example App</h1>
      <hr />
      <div>
        <div style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
          <button
            style={{
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              gap: '6px'
            }}
            onClick={() => setIsListOpen(!isListOpen)}
          >
            <h3>List of Cats</h3>
            <svg
              fill="black"
              height="13"
              style={{ rotate: isListOpen ? '0deg' : '270deg' }}
              viewBox="0 0 512 512"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
            </svg>
          </button>
        </div>
        <ul style={{ display: isListOpen ? 'block' : 'none' }}>
          {cats.map((cat, i) => (
            <li key={i}>{`Cat ${i + 1}, ${cat.name}, Age ${cat.age}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export type { CatsProps };

export default Cats;
