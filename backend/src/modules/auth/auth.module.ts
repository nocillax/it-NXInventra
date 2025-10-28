import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from 'src/database/entities/item.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Access } from 'src/database/entities/access.entity';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([Item, Access, Inventory]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, GoogleStrategy, GithubStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
