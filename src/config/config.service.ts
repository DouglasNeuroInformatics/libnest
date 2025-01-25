import { Inject, Injectable } from '@nestjs/common';

import { CONFIG_TOKEN } from './config.token.js';

import type { AppConfig } from '../types.js';

@Injectable()
export class ConfigService {
  constructor(@Inject(CONFIG_TOKEN) private readonly config: AppConfig) {}

  get<TKey extends Extract<keyof AppConfig, string>>(key: TKey): AppConfig[TKey] {
    return this.config[key];
  }
}
