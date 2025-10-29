import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Access } from 'src/database/entities/access.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

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
    let user = await this.userRepository.findOne({
      where: { provider: profile.provider, providerId: profile.providerId },
    });

    if (user) {
      // Update user info on login in case their avatar or name changed
      user.name = profile.name;
      return this.userRepository.save(user);
    }

    // If user does not exist, create a new one
    const newUser = this.userRepository.create(profile);
    return this.userRepository.save(newUser);
  }

  async searchUsers(
    query: string,
    limit: number = 10,
  ): Promise<{ id: string; name: string; email: string }[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.email'])
      .where('user.name ILIKE :query OR user.email ILIKE :query', {
        query: `%${query}%`,
      })
      .limit(limit)
      .getMany();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      theme: user.theme,
      language: user.language,
      createdAt: user.createdAt,
    };
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updatePreferencesDto.name) {
      user.name = updatePreferencesDto.name;
    }
    if (updatePreferencesDto.theme) {
      user.theme = updatePreferencesDto.theme;
    }
    if (updatePreferencesDto.language) {
      user.language = updatePreferencesDto.language;
    }

    return this.userRepository.save(user);
  }

  async blockUser(userId: string, currentUserId: string): Promise<User> {
    await this.validateAdmin(currentUserId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.blocked = true;
    return this.userRepository.save(user);
  }

  async unblockUser(userId: string, currentUserId: string): Promise<User> {
    await this.validateAdmin(currentUserId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.blocked = false;
    return this.userRepository.save(user);
  }

  async promoteToAdmin(userId: string, currentUserId: string): Promise<User> {
    await this.validateAdmin(currentUserId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isAdmin = true;
    return this.userRepository.save(user);
  }

  async demoteFromAdmin(userId: string, currentUserId: string): Promise<User> {
    await this.validateAdmin(currentUserId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Allow admin to demote themselves (as required by project)
    user.isAdmin = false;
    return this.userRepository.save(user);
  }

  async deleteUser(
    userId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    // Allow admin or self-deletion
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!currentUser?.isAdmin && currentUserId !== userId) {
      throw new ForbiddenException('Only admin or self can delete user');
    }

    const userToDelete = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['accessRecords'],
    });

    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check each inventory where user has access for sole ownership
      for (const access of userToDelete.accessRecords) {
        if (access.role === 'Owner') {
          const ownerCount = await queryRunner.manager.count(Access, {
            where: {
              inventoryId: access.inventoryId,
              role: 'Owner',
            },
          });

          if (ownerCount === 1) {
            // User is sole owner - delete entire inventory (cascade will handle related data)
            await queryRunner.manager.delete(Inventory, access.inventoryId);
          }
        }
      }

      // Delete user (this will cascade delete their access records)
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

  private async validateAdmin(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }
}
