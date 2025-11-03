import { IsEnum, IsUUID } from 'class-validator';
import type { AccessRole } from '../../database/entities/access.entity';

export class AddAccessDto {
  @IsUUID()
  userId: string;

  @IsEnum(['Owner', 'Editor', 'Viewer'])
  role: AccessRole;
}
