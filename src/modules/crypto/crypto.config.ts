import { ConfigurableModuleBuilder } from '@nestjs/common';

type CryptoModuleOptions = {
  secretKey: string;
};

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<CryptoModuleOptions>()
  .setExtras({ isGlobal: false }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal
  }))
  .build();

export {
  ConfigurableModuleClass as ConfigurableCryptoModule,
  type CryptoModuleOptions,
  MODULE_OPTIONS_TOKEN as CRYPTO_MODULE_OPTIONS_TOKEN
};
