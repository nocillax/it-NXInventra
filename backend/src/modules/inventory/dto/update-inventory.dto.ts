import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';

class CustomFieldDto {
  // Making this more robust based on PRD
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: 'text' | 'number' | 'boolean' | 'url' | 'longtext';

  @IsBoolean()
  @IsOptional()
  showInTable?: boolean;
}

class IdFormatDto {
  @IsString()
  id: string;

  @IsString()
  type:
    | 'fixed'
    | 'date'
    | 'sequence'
    | 'random_20bit'
    | 'random_32bit'
    | 'random_6digit'
    | 'random_9digit'
    | 'guid';

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  format?: string;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IdFormatDto)
  idFormat?: IdFormatDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields?: CustomFieldDto[];
}
