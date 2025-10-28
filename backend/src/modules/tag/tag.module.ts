import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { Tag } from 'src/database/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])], // Add this line
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService], // Export if other modules need to use TagService
})
export class TagModule {}
