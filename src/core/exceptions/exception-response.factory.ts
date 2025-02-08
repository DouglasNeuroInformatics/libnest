import { HttpException, Injectable } from '@nestjs/common';

type ExceptionResponseBody = {
  statusCode: number;
};

@Injectable()
export class ExceptionResponseFactory {
  forHttpException(exception: HttpException): ExceptionResponseBody {
    return {
      statusCode: exception.getStatus()
    };
  }
}
