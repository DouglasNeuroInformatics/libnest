import { DataTransferObject } from '../../../src/index.js';
import { $Cat } from '../schemas/cat.schema.js';

export class CreateCatDto extends DataTransferObject($Cat.omit({ _id: true })) {}
