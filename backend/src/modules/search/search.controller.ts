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

@Controller('api/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ) {
    // Check if user exists in request (added by JWT guard)
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = req.user.id;

    // Validate page and limit
    const pageNum = Math.max(1, parseInt(page as any) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as any) || 10), 50); // Max 50 per page

    return this.searchService.globalSearch(query, userId, pageNum, limitNum);
  }
}
