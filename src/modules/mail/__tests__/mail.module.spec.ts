import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { MAIL_MODULE_OPTIONS_TOKEN } from '../mail.config.js';
import { MailModule } from '../mail.module.js';
import { MailService } from '../mail.service.js';
import { mailModuleOptionsStub as optionsStub } from './stubs/mail-module-options.stub.js';

import type { MailModuleOptions } from '../mail.config.js';

describe('MailModule', () => {
  it('should provide the mail service when invoked synchronously', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MailModule.forRoot(optionsStub)]
    }).compile();
    const mailService = moduleRef.get(MailService);
    expect(mailService).toBeInstanceOf(MailService);
  });
  it('should provide the module options token when invoked asynchronously', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MailModule.forRootAsync({
          inject: ['FACTORY_OPTIONS'],
          provideInjectionTokensFrom: [
            {
              provide: 'FACTORY_OPTIONS',
              useValue: optionsStub
            }
          ],
          useFactory: (options: MailModuleOptions) => {
            return options;
          }
        })
      ]
    }).compile();
    expect(moduleRef.get(MAIL_MODULE_OPTIONS_TOKEN)).toStrictEqual(optionsStub);
  });
});
