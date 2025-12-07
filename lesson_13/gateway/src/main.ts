import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpTraceInterceptor } from './interceptors/http.trace-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new HttpTraceInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
