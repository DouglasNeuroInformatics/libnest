import { describe, expect, it, vi } from 'vitest';

import { delay } from '../delay.middleware.js';

describe('delay', () => {
  it('should call next after the specified delay', async () => {
    const responseDelay = 100;
    const middleware = delay({ responseDelay });
    const next = vi.fn();
    const start = Date.now();
    middleware(null as any, null as any, next);
    expect(next).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, responseDelay + 10));
    expect(next).toHaveBeenCalled();
    expect(Date.now() - start).toBeGreaterThanOrEqual(responseDelay);
  });
});
