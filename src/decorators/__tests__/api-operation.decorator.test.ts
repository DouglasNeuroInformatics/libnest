import { describe, expect, it } from 'vitest';

import { API_OPERATION_METADATA_KEY, ApiOperation } from '../api-operation.decorator.js';

describe('ApiOperation', () => {
  it('should attach the options to the route handler', () => {
    class CatsController {
      @ApiOperation({ deprecated: true, description: 'Returns every cat', summary: 'Get All Cats' })
      findAll() {
        return [];
      }
    }
    expect(
      Reflect.getMetadata(API_OPERATION_METADATA_KEY, Reflect.get(CatsController.prototype, 'findAll') as object)
    ).toEqual({
      deprecated: true,
      description: 'Returns every cat',
      summary: 'Get All Cats'
    });
  });
});
