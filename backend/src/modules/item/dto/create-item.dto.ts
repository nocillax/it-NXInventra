import { IsObject, IsNotEmpty } from 'class-validator';

export class CreateItemDto {
  @IsObject()
  @IsNotEmpty()
  fields: Record<string, any>;
}
