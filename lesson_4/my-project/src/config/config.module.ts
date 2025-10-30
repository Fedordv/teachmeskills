import { Module } from '@nestjs/common';
import { APP_CONFIG } from './config';

@Module({
  providers: [
    {
      provide: 'APP_CONFIG',
      useValue: APP_CONFIG,
    },
  ],
  exports: ['APP_CONFIG'],
})
export class ConfigModule {}
