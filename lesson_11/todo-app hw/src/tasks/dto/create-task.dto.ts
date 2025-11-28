import { IsOptional, IsString, MinLength, IsBoolean, IsDateString, IsIn } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  userId: string; 

  @IsOptional()
  @IsBoolean()
  completed?: boolean = false;

  @IsOptional()
  @IsIn(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
