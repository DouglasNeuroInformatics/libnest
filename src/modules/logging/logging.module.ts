import { type DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { Request, Response } from 'express';
import { LoggerModule } from 'nestjs-pino';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import type { DestinationStream } from 'pino';
import type { Options as PinoHttpOptions } from 'pino-http';
import { build as PinoPretty } from 'pino-pretty';

@Module({})
export class LoggingModule {
  static forRoot(options: { debug: boolean }): DynamicModule {
    return {
      global: true,
      imports: [
        LoggerModule.forRoot({
          pinoHttp: options.debug ? this.getPinoHttpOptions() : undefined
        })
      ],
      module: LoggingModule,
      providers: this.getProviders()
    };
  }

  private static getPinoHttpOptions(): [PinoHttpOptions, DestinationStream] | undefined {
    return [
      {
        customLogLevel: (_, res) => {
          return res.statusCode >= 500 ? 'error' : 'info';
        },
        serializers: {
          req: (req: Request) => {
            return `${req.method} ${req.url}`;
          },
          res: (res: Response) => {
            return res.statusCode;
          }
        },
        wrapSerializers: false
      },
      PinoPretty({
        colorize: true
      })
    ];
  }

  private static getProviders() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    return [
      {
        provide: APP_INTERCEPTOR,
        useClass: LoggerErrorInterceptor
      }
    ];
  }
}
