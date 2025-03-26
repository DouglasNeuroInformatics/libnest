import type { Err, Ok } from 'neverthrow';
import type { Transporter } from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MailService } from '../mail.service.js';
import { mailModuleOptionsStub as optionsStub } from './stubs/mail-module-options.stub.js';

import type { MockedInstance } from '../../../testing/index.js';

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
    it('should send mail and return the info from nodemailer', async () => {
      mockTransport.sendMail.mockImplementationOnce((_, callback) => {
        callback(null, { success: true });
      });
      const result = (await mailService.sendMail({})) as Ok<never, any>;
      expect(result.isOk()).toBe(true);
      expect(result.value).toStrictEqual({ success: true });
    });

    it('should handle errors sending mail', async () => {
      const nodemailerError = new Error('Nodemailer error!');
      mockTransport.sendMail.mockImplementationOnce((_, callback) => {
        callback(nodemailerError);
      });
      const result = (await mailService.sendMail({})) as Err<Error, never>;
      expect(result.isErr()).toBe(true);
      expect(result.error).toMatchObject({
        cause: nodemailerError,
        message: 'Failed to send mail'
      });
    });
  });
});
