import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { tap } from 'rxjs';

@Injectable()
export class HttpTraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();

    const traceId = randomUUID();
    request.traceId = traceId;

    const start = Date.now();

    console.log('[gateway] HTTP request start', {
      traceId,
      path: request.path,
      method: request.method,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log('[gateway] HTTP request finish', {
          traceId,
          duration: `${duration}ms`,
        });
      }),
    );
  }
}