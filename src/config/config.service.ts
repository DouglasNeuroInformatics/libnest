import { Inject, Injectable } from '@nestjs/common';

import { CONFIG_TOKEN } from './config.token.js';

import type { UserConfig } from '../types.js';

@Injectable()
export class ConfigService {
  constructor(@Inject(CONFIG_TOKEN) private readonly config: UserConfig) {}

  get<TKey extends Extract<keyof UserConfig, string>>(key: TKey): UserConfig[TKey] {
    return this.config[key];
  }
}
