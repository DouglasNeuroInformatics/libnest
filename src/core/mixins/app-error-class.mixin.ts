export class BaseAppError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function AppErrorClass() {
  return class extends BaseAppError {
    constructor(message: string) {
      super(message);
    }
  };
}
