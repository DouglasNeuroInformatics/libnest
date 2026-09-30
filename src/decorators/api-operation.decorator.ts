import { defineToken } from '../utils/token.utils.js';

const { API_OPERATION_METADATA_KEY } = defineToken('API_OPERATION_METADATA_KEY');

export type ApiOperationOptions = {
  /** Whether the operation is deprecated */
  deprecated?: boolean;
  /** A longer explanation of the operation, which may use CommonMark syntax */
  description?: string;
  /** A short summary of what the operation does */
  summary?: string;
};

/**
 * Describe a route handler in the API docs
 * @param options - the summary, description, and deprecation status of the operation
 */
export function ApiOperation(options: ApiOperationOptions): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    Reflect.defineMetadata(API_OPERATION_METADATA_KEY, options, descriptor.value as object);
  };
}

export { API_OPERATION_METADATA_KEY };
