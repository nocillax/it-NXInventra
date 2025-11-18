import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  summary: string;

  @IsIn(['High', 'Average', 'Low'])
  priority: 'High' | 'Average' | 'Low';

  @IsOptional()
  @IsString()
  inventoryTitle?: string;

  @IsString()
  pageLink: string;
}
