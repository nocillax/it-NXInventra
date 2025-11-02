import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomFieldDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  showInTable?: boolean = false;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class AddCustomFieldsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  fields: CustomFieldDto[];
}
