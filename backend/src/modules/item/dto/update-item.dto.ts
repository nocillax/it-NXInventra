import { IsObject, IsNotEmpty } from 'class-validator';

export class UpdateItemDto {
  @IsObject()
  @IsNotEmpty()
  fields: Record<string, any>;
}
