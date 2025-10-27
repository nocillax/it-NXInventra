import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { UserService, UserProfile } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(profile: UserProfile): Promise<User> {
    return this.userService.findOrCreate(profile);
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
}
