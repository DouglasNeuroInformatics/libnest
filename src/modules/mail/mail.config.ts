import type { JSX } from 'react';

import { ConfigurableModuleBuilder } from '@nestjs/common';

export type SendMailOptions = {
  body: {
    jsx?: JSX.Element;
    text: string;
  };
  from?: string;
  subject: string;
  to?: string;
};

export type MailModuleOptions = {
  auth: {
    password: string;
    username: string;
  };
  defaultSendOptions: Required<Pick<SendMailOptions, 'from'>>;
  host: string;
  port: 25 | 465 | 587;
  secure: boolean;
};

export const { ConfigurableModuleClass: ConfigurableMailModule, MODULE_OPTIONS_TOKEN: MAIL_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<MailModuleOptions>().setClassMethodName('forRoot').build();
