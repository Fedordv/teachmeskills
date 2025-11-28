import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TasksService } from '../../tasks/tasks.service';
import { request } from 'express';

@Injectable()
export class TaskChangeLoggerInterceptor implements NestInterceptor {
  constructor(private readonly tasks: TasksService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const id = req.params?.id;

    let before: any = null;

    if (id) {
      try {
        before = await this.tasks.findOne(id);
      } catch {}
    }

    return next.handle().pipe(
      tap(async (after) => {
        console.log('--- TASK CHANGE ---');
        console.log('METHOD:', req.method);
        console.log('BODY:', req.body);

        if (before && after) {
          const diff = this.getDiff(before, after);
          console.log('DIFF:', diff);
        }
        console.log('------');
      }),
    );
  }

  private getDiff(oldObj: any, newObj: any) {
    const diff = {};
    for (const key of Object.keys(newObj)) {
      if (oldObj[key] !== newObj[key]) {
        diff[key] = {
          from: oldObj[key],
          to: newObj[key],
        };
      }
    }
    return diff;
  }
}
