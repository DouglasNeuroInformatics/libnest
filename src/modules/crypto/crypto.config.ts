import { ConfigurableModuleBuilder } from '@nestjs/common';

type PBKDF2Params = {
  iterations: number;
};

type CryptoModuleOptions = {
  pbkdf2Params?: PBKDF2Params;
  secretKey: string;
};

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<CryptoModuleOptions>()
  .setExtras({ isGlobal: false }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal
  }))
  .build();

export { ConfigurableModuleClass as ConfigurableCryptoModule, MODULE_OPTIONS_TOKEN as CRYPTO_MODULE_OPTIONS_TOKEN };
export type { CryptoModuleOptions };
