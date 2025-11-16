import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  // async findAll(): Promise<Task[]> {
  //   return this.taskRepository.find({
  //     order: { createAt: 'DESC' },
  //   });
  // }
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

    query
      .orderBy('task.createAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    return {
      data: await query.getMany(),
      total,
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    // this.auth.issueToken(userId);

    const task = this.taskRepository.create({
      title: dto.title,
      completed: dto.completed ?? false,
      ownerId: dto.userId,
    });

    const saveTask = await this.taskRepository.save(task);

    return saveTask;
  }

  private async getOwnerTask(id: string): Promise<Task> {
    // if (!token) {
    //   throw new UnauthorizedException('missing token');
    // }
    // const ownerId = this.auth.verifyToken(token);
    const task = await this.findOne(id);

    // if (task.ownerId !== ownerId) {
    //   throw new ForbiddenException('access denied');
    // }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.getOwnerTask(id);

    this.taskRepository.merge(task, {
      title: dto.title ?? task.title,
      completed: dto.completed ?? task.completed,
    });

    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.getOwnerTask(id);

    await this.taskRepository.softDelete(task.id);
  }

  async complete(id: string) {
    const task = await this.getOwnerTask(id);

    if (!task.completed) {
      task.completed = true;
      await this.taskRepository.save(task);
    }

    return task;
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
}
