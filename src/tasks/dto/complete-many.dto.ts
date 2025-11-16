import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class completeManyDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids: string[];
}
