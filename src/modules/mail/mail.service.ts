import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import { createTransport } from 'nodemailer';
import type { SendMailOptions, Transporter } from 'nodemailer';

import { MAIL_MODULE_OPTIONS_TOKEN } from './mail.config.js';

import type { MailModuleOptions } from './mail.config.js';

@Injectable()
export class MailService {
  private readonly defaultSendOptions: SendMailOptions;
  private readonly transporter: Transporter;

  constructor(@Inject(MAIL_MODULE_OPTIONS_TOKEN) { auth, defaultSendOptions, ...options }: MailModuleOptions) {
    this.defaultSendOptions = defaultSendOptions;
    this.transporter = createTransport({
      auth: {
        pass: auth.password,
        user: auth.username
      },
      ...options
    });
  }

  sendMail(options: SendMailOptions): ResultAsync<unknown, typeof RuntimeException.Instance> {
    return ResultAsync.fromPromise(
      new Promise((resolve, reject) => {
        this.transporter.sendMail({ ...this.defaultSendOptions, ...options }, (err, info) => {
          if (err) {
            return reject(err);
          }
          resolve(info);
        });
      }),
      (err) => new RuntimeException('Failed to send mail', { cause: err })
    );
  }
}
