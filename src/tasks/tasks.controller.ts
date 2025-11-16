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
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { completeManyDto } from './dto/complete-many.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('completed', ParseBoolPipe) completed?: boolean,
    @Query('title') title?: string,
  ) {
    const { data, total } = await this.tasks.findAll(page, limit, completed, title);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasks.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.tasks.remove(id);
  }

  @Patch('complete')
  completeMany(@Body() dto: completeManyDto) {
    return this.tasks.completeMany(dto.ids);
  }

  @Patch(':id/restore')
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasks.restore(id);
  }
}
