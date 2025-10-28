import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IsNotEmpty, IsString } from 'class-validator';

// NEW DTO for tag updates
export class UpdateTagDto {
  @IsString()
  @IsNotEmpty()
  newName: string;
}

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('autocomplete')
  async autocomplete(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ) {
    if (!query) return [];
    return this.tagService.autocomplete(query, limit);
  }

  @Get('popular')
  async getPopularTags(@Query('limit') limit: number = 20) {
    return this.tagService.getPopularTags(limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTags(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.tagService.getAllTags(page, limit);
  }

  // NEW: Delete a tag
  @UseGuards(JwtAuthGuard)
  @Delete(':name')
  async deleteTag(@Param('name') tagName: string) {
    return this.tagService.deleteTag(tagName);
  }

  // NEW: Get tag details with usage stats
  @UseGuards(JwtAuthGuard)
  @Get(':name')
  async getTagDetails(@Param('name') tagName: string) {
    return this.tagService.getTagDetails(tagName);
  }

  // NEW: Update tag name
  @UseGuards(JwtAuthGuard)
  @Patch(':name')
  async updateTag(
    @Param('name') tagName: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.updateTag(tagName, updateTagDto.newName);
  }
}
