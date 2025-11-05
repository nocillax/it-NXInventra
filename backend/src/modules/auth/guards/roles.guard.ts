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
import { AppRole, ROLES_KEY } from '../decorators/roles.decorator';
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
  private static readonly ROLE_PRIORITY: AppRole[] = [
    'Viewer',
    'Editor',
    'Owner',
    'Admin',
  ];

  private getRolePriority(role: AppRole): number {
    return RolesGuard.ROLE_PRIORITY.indexOf(role);
  }

  private isRoleAtLeast(userRole: AppRole, requiredRole: AppRole): boolean {
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
    let inventoryId = request.params?.inventoryId || request.params?.id;
    if (inventoryId) return inventoryId;
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
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('inventory.public', 'public')
      .where('inventory.id = :id', { id: inventoryId })
      .getRawOne();
    return !!result?.public;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthorizedException();

    // Admin-only endpoint
    if (requiredRoles && requiredRoles.includes('Admin')) {
      if (await this.isAdmin(user.id)) return true;
      throw new ForbiddenException('Admin access required');
    }

    // Admins have access to everything else
    if (await this.isAdmin(user.id)) return true;

    // If no roles required, allow if logged in
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Filter out 'Admin' for inventory logic
    const inventoryRoles = requiredRoles.filter(
      (r) => r !== 'Admin',
    ) as AccessRole[];

    // Get inventory context
    const inventoryId = await this.getInventoryId(request);
    if (!inventoryId) throw new ForbiddenException();

    // Check if inventory is public
    const isPublicInv = await this.isInventoryPublic(inventoryId);

    // For public inventories, treat all logged-in users as Editor for item-level actions
    if (isPublicInv) {
      const minRequired = inventoryRoles
        .map((r) => this.getRolePriority(r))
        .reduce((a, b) => Math.min(a, b), 2);
      if (minRequired <= this.getRolePriority('Editor')) return true;
      if (inventoryRoles.includes('Owner')) {
        const access = await this.getUserAccess(user.id, inventoryId);
        if (access?.role === 'Owner') return true;
        throw new ForbiddenException();
      }
    }

    // For private inventories, check user's access
    const access = await this.getUserAccess(user.id, inventoryId);
    if (!access) throw new ForbiddenException();

    // Enforce role hierarchy
    const hasRequired = inventoryRoles.some((role) =>
      this.isRoleAtLeast(access.role, role),
    );
    if (!hasRequired) throw new ForbiddenException();

    return true;
  }
}
