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
import { User } from '../../../database/entities/user.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Role hierarchy: higher index = higher privilege
  private static readonly ROLE_PRIORITY: AccessRole[] = [
    'Viewer',
    'Editor',
    'Owner',
  ];

  private getRolePriority(role: AccessRole): number {
    return RolesGuard.ROLE_PRIORITY.indexOf(role);
  }

  private isRoleAtLeast(
    userRole: AccessRole,
    requiredRole: AccessRole,
  ): boolean {
    return this.getRolePriority(userRole) >= this.getRolePriority(requiredRole);
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['isAdmin'],
    });
    return !!user?.isAdmin;
  }

  private async getInventoryId(request: any): Promise<string | undefined> {
    // Try params first
    let inventoryId = request.params?.inventoryId || request.params?.id;
    if (inventoryId) return inventoryId;
    // Try itemId
    const itemId = request.params?.itemId;
    if (itemId) {
      const item = await this.itemRepository.findOne({
        where: { id: itemId },
        select: ['inventoryId'],
      });
      return item?.inventoryId;
    }
    return undefined;
  }

  private async getUserAccess(
    userId: string,
    inventoryId: string,
  ): Promise<Access | null> {
    return this.accessRepository.findOneBy({ userId, inventoryId });
  }

  private async isInventoryPublic(inventoryId: string): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
      select: ['public'],
    });
    return !!inventory?.public;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<AccessRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthorizedException();

    // Admins have access to everything
    if (await this.isAdmin(user.id)) return true;

    // If no roles required, allow if logged in
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Get inventory context
    const inventoryId = await this.getInventoryId(request);
    if (!inventoryId) throw new ForbiddenException();

    // Check if inventory is public
    const isPublicInv = await this.isInventoryPublic(inventoryId);

    // For public inventories, treat all logged-in users as Editor for item-level actions
    if (isPublicInv) {
      // If required role is Editor or lower, allow
      const minRequired = requiredRoles
        .map((r) => this.getRolePriority(r))
        .reduce((a, b) => Math.min(a, b), 2);
      if (minRequired <= this.getRolePriority('Editor')) return true;
      // Only Owner/Admin can do inventory-level changes
      if (requiredRoles.includes('Owner')) {
        const access = await this.getUserAccess(user.id, inventoryId);
        if (access?.role === 'Owner') return true;
        throw new ForbiddenException();
      }
    }

    // For private inventories, check user's access
    const access = await this.getUserAccess(user.id, inventoryId);
    if (!access) throw new ForbiddenException();

    // Enforce role hierarchy
    const hasRequired = requiredRoles.some((role) =>
      this.isRoleAtLeast(access.role, role),
    );
    if (!hasRequired) throw new ForbiddenException();

    return true;
  }
}
