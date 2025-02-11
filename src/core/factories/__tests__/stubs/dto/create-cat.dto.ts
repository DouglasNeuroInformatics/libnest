import { DataTransferObject } from '../../../../mixins/data-transfer-object.mixin.js';
import { $Cat } from '../schemas/cat.schema.js';

export class CreateCatDto extends DataTransferObject($Cat) {}
