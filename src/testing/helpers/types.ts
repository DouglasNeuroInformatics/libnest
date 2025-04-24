import type SupertestAgent from 'supertest/lib/agent.js';

export type TestAgent<TExtension = unknown> = SupertestAgent & TExtension;
