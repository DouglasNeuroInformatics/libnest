import { createHash, pbkdf2, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { CryptoOptions } from './crypto.config.js';

@Injectable()
export class CryptoService {
  private readonly pbkdf2Params: NonNullable<CryptoOptions['pbkdf2Params']>;
  private readonly secretKey: string;

  constructor(options: CryptoOptions) {
    this.pbkdf2Params = options.pbkdf2Params ?? {
      iterations: 100_000
    };
    this.secretKey = options.secretKey;
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const [hash, salt] = hashedPassword.split('$');
    const correctHash = await this.pbkdf2(password, salt!);
    return hash === correctHash;
  }

  hash(source: string): string {
    return createHash('sha256')
      .update(source + this.secretKey)
      .digest('hex');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = this.genSalt();
    const hash = await this.pbkdf2(password, salt);
    return [hash, salt].join('$');
  }

  private genSalt(): string {
    return randomBytes(16).toString('hex');
  }

  private pbkdf2(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      pbkdf2(password, salt, this.pbkdf2Params.iterations, 64, 'sha512', (err, key) => {
        if (err) {
          return reject(err);
        }
        resolve(key.toString('hex'));
      });
    });
  }
}
