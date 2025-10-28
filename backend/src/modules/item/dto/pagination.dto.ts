import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive } from 'class-validator';

// dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'customId', 'likes'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';
}
