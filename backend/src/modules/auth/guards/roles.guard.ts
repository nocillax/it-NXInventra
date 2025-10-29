import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Access, AccessRole } from '../../../database/entities/access.entity';
import { Item } from '../../../database/entities/item.entity';
import { Inventory } from '../../../database/entities/inventory.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<AccessRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // This should technically be handled by JwtAuthGuard, but as a safeguard:
      throw new UnauthorizedException();
    }

    // TODO: Implement Admin role check from user object when available
    // if (user.role === 'Admin') {
    //   return true;
    // }

    let inventoryId = request.params.id || request.params.inventoryId;
    const itemId = request.params.itemId;

    if (!inventoryId && itemId) {
      const item = await this.itemRepository.findOne({ where: { id: itemId } });
      if (item) {
        inventoryId = item.inventoryId;
      }
    }

    if (!inventoryId) {
      // If we still don't have an inventoryId, we cannot determine the role.
      throw new ForbiddenException(
        'Cannot determine inventory context for this action.',
      );
    }

    // First, check if the inventory itself is public.
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
      select: ['public'],
    });

    // If the route requires no specific role and the inventory is public, allow access.
    if ((!requiredRoles || requiredRoles.length === 0) && inventory?.public) {
      return true;
    }

    const access = await this.accessRepository.findOneBy({
      userId: user.id,
      inventoryId: inventoryId,
    });

    // If no specific roles are required, just check if the user has any access record.
    if (!requiredRoles || requiredRoles.length === 0) return !!access;

    const hasRequiredRole = requiredRoles.some((role) => access?.role === role);

    if (!access || !hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
