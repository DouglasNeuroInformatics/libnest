import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { SendMailOptions } from 'nodemailer';
import type { SetRequired } from 'type-fest';

export type MailModuleOptions = {
  auth: {
    password: string;
    username: string;
  };
  defaultSendOptions: SetRequired<SendMailOptions, 'from'>;
  host: string;
  port: 25 | 465 | 587;
  secure: boolean;
};

export const { ConfigurableModuleClass: ConfigurableMailModule, MODULE_OPTIONS_TOKEN: MAIL_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<MailModuleOptions>().setClassMethodName('forRoot').build();
