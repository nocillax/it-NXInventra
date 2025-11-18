import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { SyncToSalesforceDto } from './dto/sync-to-salesforce.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ) {
    if (!query || query.length < 2) {
      return [];
    }
    return this.userService.searchUsers(query, limit);
  }

  @Get('all')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Req() req) {
    return this.userService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updatePreferences(
    @Body(ValidationPipe) updatePreferencesDto: UpdatePreferencesDto,
    @Req() req,
  ) {
    return this.userService.updatePreferences(
      req.user.id,
      updatePreferencesDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/block')
  blockUser(@Param('id', ParseUUIDPipe) userId: string, @Req() req) {
    return this.userService.blockUser(userId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/unblock')
  unblockUser(@Param('id', ParseUUIDPipe) userId: string, @Req() req) {
    return this.userService.unblockUser(userId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/promote')
  promoteToAdmin(@Param('id', ParseUUIDPipe) userId: string, @Req() req) {
    return this.userService.promoteToAdmin(userId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/demote')
  demoteFromAdmin(@Param('id', ParseUUIDPipe) userId: string, @Req() req) {
    return this.userService.demoteFromAdmin(userId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) userId: string, @Req() req) {
    return this.userService.deleteUser(userId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-to-salesforce')
  syncToSalesforce(@Body(ValidationPipe) dto: SyncToSalesforceDto, @Req() req) {
    return this.userService.syncToSalesforce(req.user.id, dto);
  }
}
