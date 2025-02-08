import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ExceptionResponseFactory } from '../exception-response.factory.js';

describe('ExceptionResponseFactory', () => {
  const exceptionResponseFactory = new ExceptionResponseFactory();

  describe('forHttpException', () => {
    it('should parse a NotFoundException', () => {
      const responseBody = exceptionResponseFactory.forHttpException(new NotFoundException());
      expect(responseBody).toStrictEqual({
        statusCode: 404
      });
    });
  });
});
