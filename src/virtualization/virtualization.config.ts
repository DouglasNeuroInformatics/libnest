import * as vm from 'node:vm';

export type VirtualizationModuleOptions<TContext extends vm.Context = vm.Context> = {
  context: TContext;
};

export const VIRTUALIZATION_MODULE_OPTIONS_TOKEN = 'LIBNEST_VIRTUALIZATION_MODULE_OPTIONS';
