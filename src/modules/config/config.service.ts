import { Injectable } from '@nestjs/common';

import type { UserTypes } from '../../user-config.js';

@Injectable()
export class ConfigService<TEnv extends { [key: string]: unknown } = UserTypes.Env> {
  /** @hidden */
  constructor(private readonly envConfig: TEnv) {}

  /**
   * Retrieves a configuration value by key.
   * @param key The key of the configuration value to retrieve.
   * @returns The configuration value
   */
  get<TKey extends Extract<keyof TEnv, string>>(key: TKey): TEnv[TKey] {
    return this.envConfig[key];
  }

  /**
   * Retrieves a configuration value by key, throwing an error if the value is undefined.
   * @param key The key of the configuration value to retrieve.
   * @returns The configuration value.
   * @throws Error if the configuration value is undefined.
   */
  getOrThrow<TKey extends Extract<keyof TEnv, string>>(key: TKey): Exclude<TEnv[TKey], undefined> {
    const value = this.envConfig[key];
    if (value === undefined) {
      throw new Error(`Property '${key}' is undefined`);
    }
    return value as Exclude<TEnv[TKey], undefined>;
  }
}
