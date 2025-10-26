import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { User } from './users.enity';
import { error } from 'console';
import { NotFoundError } from 'rxjs';
import { CreateUserDTO } from './DTO/create-user.dto';
import { randomUUID } from 'crypto';


@Injectable()
export class UsersService implements OnModuleInit {
    

    private users : User[] = []

    findAll(): User[] {
        return this.users
    }

    findOne(id: string): User {
        const user = this.users.find(u => u.id === id)

        if(!user) {
            throw new NotFoundException(`User ${id} -> not found`)
        }

        return user
    }

    create(dto: CreateUserDTO): User {
        
        const newUSer: User = {
            id: randomUUID(),
            username: dto.username,
            email: dto.email,
            age: dto.age
        }

        if(typeof dto.username !== 'string' || dto.username.trim().length < 3){
            throw new BadRequestException('Имя пользователя должно быть строкой и не короче 3 символов')
        }

        if(dto.age !== undefined && dto.age < 4 ) {
            throw new BadRequestException('Age need to be bigger then 4')
        }

        this.users.push(newUSer)

        return newUSer
    }

    onModuleInit() {
        console.log('UserService initialized');
    }

}
