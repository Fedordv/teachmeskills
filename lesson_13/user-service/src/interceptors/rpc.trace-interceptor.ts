import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { tap } from 'rxjs';

@Injectable()
export class RpcTraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const data = context.switchToRpc().getData();

    const traceId = data?.traceId ?? 'no-trace';

    const start = Date.now();

    console.log('[user-service] handler start', {
      traceId,
      pattern: context.getHandler().name,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log('[user-service] handler finish', {
          traceId,
          duration: `${duration}ms`,
        });
      }),
    );
  }
}