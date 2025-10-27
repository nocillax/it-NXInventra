import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';

class CustomFieldDto {
  @IsString()
  name: string;
}

class IdFormatDto {
  @IsString()
  id: string;

  @IsString()
  type: 'fixed' | 'date' | 'sequence';

  @IsString()
  value?: string;

  @IsString()
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
