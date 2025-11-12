import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Access } from '../../database/entities/access.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import {
  isValidUserQuery,
  mapUserProfile,
  mapUserSearch,
} from './user.helpers';

export interface UserProfile {
  providerId: string;
  provider: 'google' | 'github';
  email: string;
  name: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  async findOrCreate(profile: UserProfile): Promise<User> {
    // Just find or create by provider + providerId, ignore email conflicts
    let user = await this.userRepository.findOne({
      where: { provider: profile.provider, providerId: profile.providerId },
    });

    if (user) {
      return user;
    }

    // Create new user even if email exists with different provider
    return this.userRepository.save(this.userRepository.create(profile));
  }

  // Gets all users with pagination
  async getAllUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' }, // Default sort by newest
    });

    return {
      users: users.map(mapUserProfile),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Searches users by name or email
  async searchUsers(query: string, limit: number = 10) {
    if (!isValidUserQuery(query)) return [];
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email', 'user.provider'])
      .where('user.name ILIKE :query OR user.email ILIKE :query', {
        query: `%${query}%`,
      })
      .limit(limit)
      .getMany();
    return users.map(mapUserSearch);
  }

  // Gets the current user's profile
  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return mapUserProfile(user);
  }

  // Updates user preferences (name, theme, language)
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.name) user.name = dto.name;
    if (dto.theme) user.theme = dto.theme;
    if (dto.language) user.language = dto.language;
    return this.userRepository.save(user);
  }

  // Blocks a user (admin only)
  async blockUser(userId: string, currentUserId: string) {
    await this.validateAdmin(currentUserId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.blocked = true;
    return this.userRepository.save(user);
  }

  // Unblocks a user (admin only)
  async unblockUser(userId: string, currentUserId: string) {
    await this.validateAdmin(currentUserId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.blocked = false;
    return this.userRepository.save(user);
  }

  // Promotes a user to admin (admin only)
  async promoteToAdmin(userId: string, currentUserId: string) {
    await this.validateAdmin(currentUserId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isAdmin = true;
    return this.userRepository.save(user);
  }

  // Demotes a user from admin (admin only, can demote self)
  async demoteFromAdmin(userId: string, currentUserId: string) {
    await this.validateAdmin(currentUserId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isAdmin = false;
    return this.userRepository.save(user);
  }

  // Deletes a user (admin or self), deletes inventories if sole owner
  async deleteUser(userId: string, currentUserId: string) {
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!currentUser?.isAdmin && currentUserId !== userId)
      throw new ForbiddenException('Only admin or self can delete user');
    const userToDelete = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['accessRecords'],
    });
    if (!userToDelete) throw new NotFoundException('User not found');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const access of userToDelete.accessRecords) {
        if (access.role === 'Owner') {
          const ownerCount = await queryRunner.manager.count(Access, {
            where: { inventoryId: access.inventoryId, role: 'Owner' },
          });
          if (ownerCount === 1)
            await queryRunner.manager.delete(Inventory, access.inventoryId);
        }
      }
      await queryRunner.manager.delete(User, userId);
      await queryRunner.commitTransaction();
      return { message: 'User deleted successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Checks if a user is admin, throws if not
  private async validateAdmin(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
  }

  // Gets a user by ID
  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return mapUserProfile(user);
  }

  // Checks if a user exists by ID
  async userExists(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
    });
    return !!user;
  }
}
