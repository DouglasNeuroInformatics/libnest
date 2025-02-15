import * as vm from 'node:vm';

import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import { isErrorLike, serializeError } from 'serialize-error';
import type { ErrorObject } from 'serialize-error';

import { LoggingService } from '../core/logging/logging.service.js';
import { VIRTUALIZATION_MODULE_OPTIONS_TOKEN } from './virtualization.config.js';

import type { VirtualizationModuleOptions } from './virtualization.config.js';

@Injectable()
export class VirtualizationService<TContext extends vm.Context = vm.Context> {
  private context: TContext;

  constructor(
    @Inject(VIRTUALIZATION_MODULE_OPTIONS_TOKEN) { context }: VirtualizationModuleOptions<TContext>,
    private readonly loggingService: LoggingService
  ) {
    this.context = context;
    vm.createContext(this.context, {
      codeGeneration: {
        strings: false,
        wasm: false
      }
    });
  }

  eval<T = unknown>(code: string): ResultAsync<T, ErrorObject> {
    return ResultAsync.fromThrowable(
      async () => {
        return (await vm.runInContext(code, this.context, {
          importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
        })) as T;
      },
      (error) => {
        this.loggingService.error(error);
        if (isErrorLike(error)) {
          return serializeError(error);
        }
        return {
          message: 'Unexpected Non-Error Thrown in VM',
          name: 'Error'
        };
      }
    )();
  }
}
