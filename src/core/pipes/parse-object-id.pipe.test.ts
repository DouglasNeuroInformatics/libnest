import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';

import { ParseObjectIdPipe } from './parse-object-id.pipe.js';

describe('ParseObjectIdPipe', () => {
  let pipe: ParseObjectIdPipe;

  beforeEach(() => {
    pipe = new ParseObjectIdPipe();
  });

  it('should create the pipe', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return the value when value is a valid ObjectId string', () => {
      const objectIdString = new ObjectId().toHexString();
      const result = pipe.transform(objectIdString);
      expect(result).toBe(objectIdString);
    });
  });
});
