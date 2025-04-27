import type { JSX } from 'react';

import type { Cat } from '../cats/schemas/cat.schema.js';

type CatsProps = {
  cats: Cat[];
};

const Cats: React.FC<CatsProps> = ({ cats }): JSX.Element => {
  return (
    <div>
      <h1>List of Cats</h1>
      <ul>
        {cats.map((cat, i) => (
          <li key={i}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
};

export type { CatsProps };

export default Cats;
