import { IsEnum } from 'class-validator';
import type { AccessRole } from '../../../database/entities/access.entity';

export class UpdateAccessDto {
  @IsEnum(['Owner', 'Editor', 'Viewer'])
  role: AccessRole;
}
