import { Injectable } from '@nestjs/common';

@Injectable()
export class JSXService {
  render(): Promise<string> {
    return Promise.resolve('<h1>Hello</h1>');
  }
}
