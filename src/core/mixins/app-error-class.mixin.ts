export class BaseAppError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function AppErrorClass(name: `${string}Error`) {
  return class extends BaseAppError {
    constructor(message: string) {
      super(message);
      this.name = name;
    }
  };
}
