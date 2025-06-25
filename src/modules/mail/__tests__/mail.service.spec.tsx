import { InternalServerErrorException } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JSXService } from '../../jsx/jsx.service.js';
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
  let jsxService: MockedInstance<JSXService>;
  let mailService: MailService;

  beforeEach(() => {
    jsxService = {
      renderToString: vi.fn()
    };
    mailService = new MailService(optionsStub, jsxService);
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
        jsx: <h1>Hello World</h1>,
        text: 'Hello World'
      },
      subject: 'Greeting'
    };

    it('should throw an InternalServerErrorException if attempting to send mail with JSX, if not configured', async () => {
      // @ts-expect-error - this is private
      vi.spyOn(mailService, 'jsxService', 'get').mockReturnValueOnce(undefined);
      await expect(() => {
        return mailService.sendMail(sendMailOptions);
      }).rejects.toThrowError(InternalServerErrorException);
    });

    it('should send mail and return the info from nodemailer', async () => {
      jsxService.renderToString.mockReturnValueOnce('<div>test</div>');
      mockTransport.sendMail.mockImplementationOnce((_, callback) => {
        callback(null, { success: true });
      });
      const result = await mailService.sendMail(sendMailOptions);
      expect(result).toStrictEqual({ success: true });
      expect(mockTransport.sendMail).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          html: '<div>test</div>'
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
