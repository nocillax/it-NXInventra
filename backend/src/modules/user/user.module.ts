import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Access } from '../../database/entities/access.entity';
import { Inventory } from '../../database/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Access, Inventory])],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
