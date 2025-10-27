import { SetMetadata } from '@nestjs/common';
import { AccessRole } from '../../../database/entities/access.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AccessRole[]) => SetMetadata(ROLES_KEY, roles);
