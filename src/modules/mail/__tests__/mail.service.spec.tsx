import type { Transporter } from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MailService } from '../mail.service.js';
import { mailModuleOptionsStub as optionsStub } from './stubs/mail-module-options.stub.js';

import type { MockedInstance } from '../../../testing/index.js';
import type { SendMailOptions } from '../mail.config.js';

const { mockTransport, nodemailer } = vi.hoisted(() => {
  const mockTransport = {
    sendMail: vi.fn().mockImplementation(() => {
      throw new Error('Implementation is not defined');
    })
  } satisfies Partial<MockedInstance<Transporter>>;
  return {
    mockTransport,
    nodemailer: {
      createTransport: vi.fn().mockImplementation(() => mockTransport)
    } satisfies Partial<typeof import('nodemailer')>
  };
});

vi.mock('nodemailer', () => nodemailer);

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(() => {
    mailService = new MailService(optionsStub);
  });

  it('should create the transporter with the correct options', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledExactlyOnceWith({
      auth: {
        pass: optionsStub.auth.password,
        user: optionsStub.auth.username
      },
      host: optionsStub.host,
      port: optionsStub.port,
      secure: optionsStub.secure
    });
  });

  describe('sendMail', () => {
    const sendMailOptions: SendMailOptions = {
      body: {
        html: '<h1>Hello World</h1>',
        text: 'Hello World'
      },
      subject: 'Greeting'
    };

    it('should send mail and return the info from nodemailer', async () => {
      mockTransport.sendMail.mockImplementationOnce((_, callback) => {
        callback(null, { success: true });
      });
      const result = await mailService.sendMail(sendMailOptions);
      expect(result).toStrictEqual({ success: true });
      expect(mockTransport.sendMail).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          html: sendMailOptions.body.html
        }),
        expect.any(Function)
      );
    });

    it('should throw an InternalServerError if there is an issue sending mail', async () => {
      const nodemailerError = new Error('Nodemailer error!');
      mockTransport.sendMail.mockImplementationOnce((_, callback) => {
        callback(nodemailerError);
      });
      await expect(() => mailService.sendMail(sendMailOptions)).rejects.toMatchObject({
        cause: nodemailerError,
        message: 'Failed to send mail'
      });
    });
  });
});
