import { Inject, Injectable, InternalServerErrorException, Optional } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { JSXService } from '../jsx/jsx.service.js';
import { MAIL_MODULE_OPTIONS_TOKEN } from './mail.config.js';

import type { MailModuleOptions, SendMailOptions } from './mail.config.js';

@Injectable()
export class MailService {
  private readonly defaultSendOptions: MailModuleOptions['defaultSendOptions'];

  private readonly transporter: Transporter;

  constructor(
    @Inject(MAIL_MODULE_OPTIONS_TOKEN) { auth, defaultSendOptions, ...options }: MailModuleOptions,
    @Inject() @Optional() private readonly jsxService?: JSXService
  ) {
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
    let html: string | undefined = undefined;
    if (body.jsx) {
      if (!this.jsxService) {
        throw new InternalServerErrorException(`Cannot use JSX without configuring JSX option in AppFactory`);
      }
      html = this.jsxService.renderToString(body.jsx);
    }
    return new Promise((resolve, reject) => {
      this.transporter.sendMail({ ...this.defaultSendOptions, html, text: body.text, ...options }, (err, info) => {
        if (err) {
          return reject(new InternalServerErrorException('Failed to send mail', { cause: err }));
        }
        resolve(info);
      });
    });
  }
}
