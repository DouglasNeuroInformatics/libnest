import { HttpException, Injectable } from '@nestjs/common';

type ExceptionResponseBody = {
  statusCode: number;
};

@Injectable()
export class ExceptionResponseFactory {
  forException(exception: unknown): [ExceptionResponseBody, number] {
    if (!(exception instanceof HttpException)) {
      throw new Error();
    }
    const body = this.forHttpException(exception);
    return [body, body.statusCode];
  }

  forHttpException(exception: HttpException): ExceptionResponseBody {
    return {
      statusCode: exception.getStatus()
    };
  }
}
