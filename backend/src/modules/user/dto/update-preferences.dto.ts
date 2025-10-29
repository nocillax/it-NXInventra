import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'])
  theme?: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'bn'])
  language?: string;
}
