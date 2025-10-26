import { IsEmail, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateUserDTO {
    @IsString()
    @MinLength(3)
    username: string

    @IsEmail()
    email: string

    @IsNumber()
    @IsOptional()
    @Min(4, {message: 'Value need to be bigger then 4'})
    age?: number
}