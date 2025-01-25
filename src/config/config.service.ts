import { Inject, Injectable } from '@nestjs/common';

import { CONFIG_TOKEN } from './config.module.js';

import type { Config } from '../types.js';

@Injectable()
export class ConfigService {
  constructor(@Inject(CONFIG_TOKEN) private readonly configuration: Config) {}

  get<TKey extends Extract<keyof Config, string>>(key: TKey): Config[TKey] {
    return this.configuration[key];
  }
}
