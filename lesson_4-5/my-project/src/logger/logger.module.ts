import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigModule } from '../config/config.module'; // импортируем ConfigModule

@Global()
@Module({})
export class LoggerModule {
  static forRoot(level: 'debug' | 'info' | 'warn' = 'info'): DynamicModule {
    return {
      module: LoggerModule,
      imports: [ConfigModule], 
      providers: [
        { 
          provide: 'LOG_LEVEL', 
          useValue: level 
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
