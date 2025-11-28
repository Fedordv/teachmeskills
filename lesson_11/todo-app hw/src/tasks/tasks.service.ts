import {
  ConflictException,
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
    private readonly taskRepo: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const existing = await this.taskRepo.findOne({
      where: { title: dto.title, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Task with this title already exist');
    }

    const task = this.taskRepo.create({
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId: dto.userId,
      priority: dto.priority,
      deadline: dto.deadline,
    });

    return this.taskRepo.save(task);
  }

  async findAll(
    page: number,
    limit: number,
    completed?: boolean,
    title?: string,
  ): Promise<{ data: Task[]; total: number }> {
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .where('task.deletedAt IS NULL');

    if (completed !== undefined) {
      qb.andWhere('task.completed = :completed', { completed });
    }

    if (title) {
      qb.andWhere('task.title ILIKE :title', { title: `%${title}%` });
    }

    const total = await qb.getCount();

    qb.orderBy('task.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const data = await qb.getMany();

    return { data, total };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
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

    this.taskRepo.merge(task, {
      title: dto.title ?? task.title,
      completed: dto.completed ?? task.completed,
    });

    return this.taskRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    const res = await this.taskRepo.softDelete({ id });

    if (!res.affected) {
      throw new NotFoundException('Task not found');
    }
  }

  async complete(id: string) {
    const task = await this.getOwnedTask(id);

    if (task.completed) {
      return task;
    }

    task.completed = true;

    return this.taskRepo.save(task);
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
        throw new ForbiddenException('some tasks are not found');
      }

      await runner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ completed: true })
        .whereInIds(ids)
        .execute();

      await runner.commitTransaction();
    } catch (e) {
      console.log(e);
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  async restore(id: string): Promise<void> {
    const res = await this.taskRepo.restore({ id });

    if (!res.affected) {
      throw new NotFoundException('Task not found or not deleted');
    }
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
