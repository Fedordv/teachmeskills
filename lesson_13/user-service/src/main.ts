import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { RpcTraceInterceptor } from './interceptors/rpc.trace-interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {host: '127.0.0.1', port: 3001}
  });
  app.useGlobalInterceptors(new RpcTraceInterceptor()); 

  await app.listen()
}
bootstrap();
