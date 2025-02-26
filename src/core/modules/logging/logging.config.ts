import { defineToken } from '../../utils/token.utils.js';

export type LoggingOptions = {
  debug?: boolean;
  log?: boolean;
  verbose?: boolean;
  warn?: boolean;
};

export const { LIBNEST_LOGGING_MODULE_OPTIONS_TOKEN } = defineToken('LIBNEST_LOGGING_MODULE_OPTIONS_TOKEN');
