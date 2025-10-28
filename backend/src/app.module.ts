import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './database/entities/user.entity';
import { Inventory } from './database/entities/inventory.entity';
import { Item } from './database/entities/item.entity';
import { Comment } from './database/entities/comment.entity';
import { Access } from './database/entities/access.entity';
import { CustomField } from './database/entities/custom_field.entity';
import { ItemFieldValue } from './database/entities/item_field_value.entity';
import { CategoryLookup } from './database/entities/category_lookup.entity';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ItemModule } from './modules/item/item.module';
import { ItemLike } from './database/entities/item_like.entity';
import { TagModule } from './modules/tag/tag.module';
import { Tag } from './database/entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          User,
          Inventory,
          Item,
          Comment,
          Access,
          CategoryLookup,
          CustomField,
          ItemFieldValue,
          ItemLike,
          Tag,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    InventoryModule,
    ItemModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
