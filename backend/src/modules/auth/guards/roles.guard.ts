import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Access, AccessRole } from '../../../database/entities/access.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AccessRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles specified, so access is granted.
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const inventoryId = request.params.id;

    if (!user || !inventoryId) {
      return false; // Should be blocked by JwtAuthGuard first.
    }

    const access = await this.accessRepository.findOneBy({
      userId: user.id,
      inventoryId: inventoryId,
    });

    if (!access || !requiredRoles.some((role) => access.role === role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
