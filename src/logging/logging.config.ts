import { ConfigurableModuleBuilder } from '@nestjs/common';

type LoggingModuleOptions = {
  debug?: boolean;
  log?: boolean;
  verbose?: boolean;
  warn?: boolean;
};

const { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<LoggingModuleOptions>()
    .setClassMethodName('forRoot')
    .setExtras({}, (definition) => ({
      ...definition,
      global: true
    }))
    .build();

export {
  ASYNC_OPTIONS_TYPE as LOGGING_MODULE_ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass as ConfigurableLoggingModule,
  MODULE_OPTIONS_TOKEN as LOGGING_MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE as LOGGING_MODULE_OPTIONS_TYPE
};

export type { LoggingModuleOptions };
