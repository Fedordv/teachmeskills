import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { User } from './users.enity';
import { UsersService } from './users.service';
import { CreateUserDTO } from './DTO/create-user.dto';

@Controller('users')
export class UsersController  {
    constructor(private readonly users: UsersService) {}

    @Get()
    findAll(){
        return this.users.findAll();
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe())id: string) {
        return this.users.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateUserDTO) {
        return this.users.create(dto)
    }
}
