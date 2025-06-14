import { Injectable } from '@nestjs/common';

import type { RuntimeEnv } from '../../user-types.js';

@Injectable()
export class ConfigService {
  /** @hidden */
  constructor(private readonly envConfig: RuntimeEnv) {}

  /**
   * Retrieves a configuration value by key.
   * @param key The key of the configuration value to retrieve.
   * @returns The configuration value
   */
  get<TKey extends Extract<keyof RuntimeEnv, string>>(key: TKey): RuntimeEnv[TKey] {
    return this.envConfig[key];
  }

  /**
   * Retrieves a configuration value by key, throwing an error if the value is undefined.
   * @param key The key of the configuration value to retrieve.
   * @returns The configuration value.
   * @throws Error if the configuration value is undefined.
   */
  getOrThrow<TKey extends Extract<keyof RuntimeEnv, string>>(key: TKey): Exclude<RuntimeEnv[TKey], undefined> {
    const value = this.envConfig[key];
    if (value === undefined) {
      throw new Error(`Property '${key}' is undefined`);
    }
    return value as Exclude<RuntimeEnv[TKey], undefined>;
  }
}
