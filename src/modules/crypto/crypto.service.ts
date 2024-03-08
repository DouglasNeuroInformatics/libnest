import crypto from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { CRYPTO_MODULE_OPTIONS_TOKEN, type CryptoModuleOptions } from './crypto.config.js';

@Injectable()
export class CryptoService {
  constructor(@Inject(CRYPTO_MODULE_OPTIONS_TOKEN) private readonly options: CryptoModuleOptions) {}

  async comparePassword(password: string, hashedPassword: string) {
    const [hash, salt] = hashedPassword.split('$');
    const correctHash = await this.pbkdf2(password, salt!);
    return hash === correctHash;
  }

  hash(source: string) {
    return crypto
      .createHash('sha256')
      .update(source + this.options.secretKey)
      .digest('hex');
  }

  async hashPassword(password: string) {
    const salt = this.genSalt();
    const hash = await this.pbkdf2(password, salt);
    return [hash, salt].join('$');
  }

  private genSalt() {
    return crypto.randomBytes(16).toString('hex');
  }

  private pbkdf2(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
        if (err) {
          return reject(err);
        }
        resolve(key.toString('hex'));
      });
    });
  }
}
