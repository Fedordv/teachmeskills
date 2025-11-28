import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  HttpCode,
  UseInterceptors,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  ParseBoolPipe,
  UsePipes,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { TaskOwnerOrAdminGuard } from '../common/guards/task-owner-or-admin.guard';
import { TasksJwtTokenGuard } from '../common/guards/tasks-jwt-token.guard';
import { PriorityDeadlinePipe } from '../common/pipe/priority-deadline.pipe';
import { TaskChangeLoggerInterceptor } from '../common/interceptors/changes-logger.interceptor';


@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('whoami')
  async getUser(@CurrentUser() user) {
    return user ?? { message: 'no user' };
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('completed') completed?: boolean,
    @Query('title') title?: string,
  ) {
    const { data, total } = await this.tasks.findAll(
      page,
      limit,
      completed,
      title,
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const task = await this.tasks.findOne(id);

    return task;
  }

  @Post()
  @HttpCode(201)
  @UsePipes(PriorityDeadlinePipe)
  @UseInterceptors(TaskChangeLoggerInterceptor)
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Delete(':id')
  // @UseGuards(ApiKeyGuard)
  @UseGuards(TasksJwtTokenGuard)
  @UseInterceptors(TaskChangeLoggerInterceptor)
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.tasks.remove(id);
  }

  @Patch(':id/complete')
  @UseGuards(TasksJwtTokenGuard)
  complete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasks.complete(id);
  }

  @Patch('complete')
  @UseGuards(TasksJwtTokenGuard)
  completeMany(@Body() dto: CompleteManyDto) {
    return this.tasks.completeMany(dto.ids);
  }

  @Patch(':id')
  // @UseGuards(TaskOwnerOrAdminGuard)
  @UsePipes(PriorityDeadlinePipe)
  @UseInterceptors(TaskChangeLoggerInterceptor)
  @UseGuards(TasksJwtTokenGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, dto);
  }

  @Patch(':id/restore')
  @HttpCode(201)
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasks.restore(id);
  }
}
// testUser
// 01648282-e123-4828-9226-0abef1225ede
