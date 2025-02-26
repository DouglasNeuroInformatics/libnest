import * as vm from 'node:vm';

import { defineToken } from '../core/utils/token.utils.js';

export type VirtualizationModuleOptions<TContext extends vm.Context = vm.Context> = {
  context: TContext;
};

export const { LIBNEST_VIRTUALIZATION_MODULE_OPTIONS_TOKEN } = defineToken(
  'LIBNEST_VIRTUALIZATION_MODULE_OPTIONS_TOKEN'
);
