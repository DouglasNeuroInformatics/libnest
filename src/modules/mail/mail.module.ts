import { Module } from '@nestjs/common';

import { ConfigurableMailModule } from './mail.config.js';
import { MailService } from './mail.service.js';

@Module({
  exports: [MailService],
  providers: [MailService]
})
export class MailModule extends ConfigurableMailModule {}
