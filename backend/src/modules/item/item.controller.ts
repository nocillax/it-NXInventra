import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PaginationDto } from './dto/pagination.dto';

@Controller()
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @UseGuards(JwtAuthGuard)
  @Get('inventories/:id/fields') // NEW ENDPOINT
  getInventoryFields(@Param('id', ParseUUIDPipe) inventoryId: string) {
    return this.itemService.getInventoryFields(inventoryId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('inventories/:id/items')
  create(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) createItemDto: CreateItemDto,
    @Req() req,
  ) {
    return this.itemService.create(inventoryId, createItemDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventories/:id/items')
  findAll(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    return this.itemService.findAll(inventoryId, paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('inventories/:id/validate-id')
  validateCustomId(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body() validateIdDto: { customId: string },
  ) {
    return this.itemService.validateCustomId(
      inventoryId,
      validateIdDto.customId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('items/:itemId')
  findOne(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.itemService.findOne(itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:itemId')
  update(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body(ValidationPipe) updateItemDto: UpdateItemDto,
    @Req() req,
  ) {
    return this.itemService.update(itemId, updateItemDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:itemId')
  remove(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.itemService.remove(itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:itemId/like')
  toggleLike(@Param('itemId', ParseUUIDPipe) itemId: string, @Req() req) {
    return this.itemService.toggleLike(itemId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('items/:itemId/like-status')
  getLikeStatus(@Param('itemId', ParseUUIDPipe) itemId: string, @Req() req) {
    return this.itemService.hasUserLikedItem(itemId, req.user.id);
  }

  @Get('inventories/:id/stats')
  getInventoryStats(@Param('id', ParseUUIDPipe) inventoryId: string) {
    return this.itemService.getInventoryStats(inventoryId);
  }
}
