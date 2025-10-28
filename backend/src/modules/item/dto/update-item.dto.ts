import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateItemDto {
  @IsNumber()
  version: number;

  @IsOptional()
  fields?: Record<string, any>;

  @IsOptional()
  @IsString()
  customId?: string;
}
