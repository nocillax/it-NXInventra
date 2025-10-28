import { IsEnum } from 'class-validator';
import type { AccessRole } from 'src/database/entities/access.entity';

export class UpdateAccessDto {
  @IsEnum(['Owner', 'Editor', 'Viewer'])
  role: AccessRole;
}
