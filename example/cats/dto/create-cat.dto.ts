import { DataTransferObject } from '../../../src/core/index.js';
import { $Cat } from '../schemas/cat.schema.js';

export class CreateCatDto extends DataTransferObject($Cat) {}
