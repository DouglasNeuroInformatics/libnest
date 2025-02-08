import { ValidationSchema } from '../../../src/core/index.js';
import { $Cat } from '../schemas/cat.schema.js';

@ValidationSchema($Cat)
export class CreateCatDto {
  age: number;
  name: string;
}
