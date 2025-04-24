import type SupertestAgent from 'supertest/lib/agent.js';

interface TestResponse {
  [key: string]: any;
  body: any;
  headers: {
    [key: string]: string;
  };
  ok: boolean;
  status: number;
  text: string;
  type: string;
}

interface TestRequest extends PromiseLike<TestResponse> {
  [key: string]: any;
  accept(type: string): this;
  method: string;
  send(data?: object | string): this;
  set(field: string, val: string): this;
  url: string;
}

interface TestAgentMethods {
  delete: (url: string) => TestRequest;
  get: (url: string) => TestRequest;
  patch: (url: string) => TestRequest;
  post: (url: string) => TestRequest;
  put: (url: string) => TestRequest;
}

// this is so we don't have to include the garbage supertest types in production
export type TestAgent<T = unknown> = SupertestAgent extends TestAgentMethods ? T & TestAgentMethods : never;
