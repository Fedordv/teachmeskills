import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  constructor(
    @Inject('LOG_LEVEL') private level: string,
    @Inject('APP_CONFIG') private config: { debug: boolean },
  ) {}

  log(message: string, level: 'debug' | 'info' | 'warn' = 'info') {
    if (!this.config.debug) return;

    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}
