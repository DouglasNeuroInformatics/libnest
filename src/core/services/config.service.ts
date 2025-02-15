import { Injectable } from '@nestjs/common';

import type { RuntimeConfig } from '../../config.js';

@Injectable()
export class ConfigService {
  /** @hidden */
  constructor(private readonly config: RuntimeConfig) {}

  /**
   * Retrieves a configuration value by key.
   * @param key The key of the configuration value to retrieve.
   * @returns The configuration value
   */
  get<TKey extends Extract<keyof RuntimeConfig, string>>(key: TKey): RuntimeConfig[TKey] {
    return this.config[key];
  }

  /**
   * Retrieves a configuration value by key, throwing an error if the value is undefined.
   * @param key The key of the configuration value to retrieve.
   * @returns The configuration value.
   * @throws Error if the configuration value is undefined.
   */
  getOrThrow<TKey extends Extract<keyof RuntimeConfig, string>>(key: TKey): Exclude<RuntimeConfig[TKey], undefined> {
    const value = this.config[key];
    if (value === undefined) {
      throw new Error(`Property '${key}' is undefined`);
    }
    return value as Exclude<RuntimeConfig[TKey], undefined>;
  }
}
