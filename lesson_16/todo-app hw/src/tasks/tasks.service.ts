import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId: dto.userId,
    });
    return this.taskRepository.save(task);
  }

  async findAll(
    page: number,
    limit: number,
    completed?: boolean,
    title?: string,
  ): Promise<{ data: Task[]; total: number }> {
    const query = this.taskRepository.createQueryBuilder('task');

    if (completed !== undefined) {
      query.andWhere('task.completed = :completed', { completed });
    }

    if (title) {
      query.andWhere('task.title = :title', { title });
    }

    const total = await query.getCount();

    query.orderBy('task.createAt', 'DESC').take(limit).skip((page - 1) * limit);

    return {
      data: await query.getMany(),
      total,
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} - not found`);
    }

    return task;
  }

  private async getOwnedTask(id: string): Promise<Task> {
    return this.findOne(id);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.getOwnedTask(id);

    this.taskRepository.merge(task, {
      title: dto.title ?? task.title,
      completed: dto.completed ?? task.completed,
    });

    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const res = await this.taskRepository.softDelete({ id });
    if (!res.affected) {
      throw new NotFoundException('Task not found');
    }
  }

  async complete(id: string) {
    const task = await this.getOwnedTask(id);
    if (task.completed) return task;

    task.completed = true;
    return this.taskRepository.save(task);
  }

  async completeMany(ids: string[]) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const tasks = await runner.manager.find(Task, {
        where: { id: In(ids) },
        withDeleted: false,
      });
      if (tasks.length !== ids.length) {
        throw new ForbiddenException('Some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ completed: true })
        .whereInIds(ids)
        .execute();

      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  async restore(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    await this.taskRepository.restore(task.id);
    return task;
  }

  toHateoas(task: Task) {
    return {
      ...task,
      _links: {
        self: { href: `/tasks/${task.id}` },
        update: { href: `/tasks/${task.id}`, method: 'PATCH' },
        delete: { href: `/tasks/${task.id}`, method: 'DELETE' },
        complete: { href: `/tasks/${task.id}/complete`, method: 'PATCH' },
      },
    };
  }
}
