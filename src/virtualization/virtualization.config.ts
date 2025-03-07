import * as vm from 'node:vm';

import { defineToken } from '../utils/token.utils.js';

export type VirtualizationModuleOptions<TContext extends vm.Context = vm.Context> = {
  context: TContext;
  contextOptions?: vm.CreateContextOptions;
};

export const { VIRTUALIZATION_MODULE_OPTIONS_TOKEN } = defineToken('VIRTUALIZATION_MODULE_OPTIONS_TOKEN');
