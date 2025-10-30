import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { debug } from 'console';

@Module({
  imports: [
    UsersModule,
    LoggerModule.forRoot('debug'), 
    ConfigModule,  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
