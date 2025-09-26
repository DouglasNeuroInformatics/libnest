import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { MAIL_MODULE_OPTIONS_TOKEN } from './mail.config.js';

import type { MailModuleOptions, SendMailOptions } from './mail.config.js';

@Injectable()
export class MailService {
  private readonly defaultSendOptions: MailModuleOptions['defaultSendOptions'];

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

  async sendMail({ body, ...options }: SendMailOptions): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(
        { ...this.defaultSendOptions, html: body.html, text: body.text, ...options },
        (err, info) => {
          if (err) {
            return reject(new InternalServerErrorException('Failed to send mail', { cause: err }));
          }
          resolve(info);
        }
      );
    });
  }
}
