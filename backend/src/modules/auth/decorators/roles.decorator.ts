import { SetMetadata } from '@nestjs/common';
import { AccessRole } from '../../../database/entities/access.entity';

export type AppRole = AccessRole | 'Admin';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
