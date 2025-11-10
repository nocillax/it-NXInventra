// src/modules/search/search.controller.ts
import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { SearchService } from './search.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ) {
    const userId = req.user?.id || null;

    // Validate page and limit
    const pageNum = Math.max(1, parseInt(page as any) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as any) || 10), 50); // Max 50 per page

    return this.searchService.globalSearch(query, userId, pageNum, limitNum);
  }
}
