import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

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
}
