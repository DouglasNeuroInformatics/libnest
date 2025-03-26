import type { MailModuleOptions } from '../../mail.config.js';

export const mailModuleOptionsStub: MailModuleOptions = Object.freeze({
  auth: {
    password: 'password',
    username: 'admin'
  },
  defaultSendOptions: {
    from: 'mail@example.org'
  },
  host: 'smtp.example.org',
  port: 587,
  secure: true
});
