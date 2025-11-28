import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { TaskPriority } from "../task-priority";

@Injectable()
export class PriorityDeadlinePipe implements PipeTransform {
    transform(value: any) {
        const {priority, deadline} = value 

        if(!priority) return value;

        const now = new Date()
        const deadlineDate = deadline ? new Date(deadline) : null;

        
    switch (priority) {
      case TaskPriority.HIGH:
        if (!deadlineDate) {
          throw new BadRequestException('High priority requires deadline');
        }
        const diffHours =
          (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
          throw new BadRequestException(
            'High priority tasks must have deadline at least 24 hours ahead',
          );
        }
        break;

      case TaskPriority.MEDIUM:
        if (!deadlineDate || deadlineDate <= now) {
          throw new BadRequestException(
            'Medium priority tasks require future deadline',
          );
        }
        break;

      case TaskPriority.LOW:
        break;
    }

    return value;
    }
}