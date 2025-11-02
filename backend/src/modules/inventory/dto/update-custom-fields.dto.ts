import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  showInTable?: boolean;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  // Note: type is included but will be validated in service to prevent changes
  @IsOptional()
  @IsString()
  type?: string;
}
