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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller()
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Editor')
  @Post('inventories/:id/items')
  create(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) createItemDto: CreateItemDto,
    @Req() req,
  ) {
    return this.itemService.createItem(inventoryId, createItemDto, req.user.id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Editor')
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

  @UseGuards(OptionalJwtAuthGuard)
  @Get('inventories/:id/fields')
  getInventoryFields(@Param('id', ParseUUIDPipe) inventoryId: string) {
    return this.itemService.getInventoryFields(inventoryId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('inventories/:id/items')
  findAll(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    return this.itemService.findAll(inventoryId, paginationDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('items/:itemId')
  findOne(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.itemService.findOne(itemId);
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get('items/:itemId/like-status')
  getLikeStatus(@Param('itemId', ParseUUIDPipe) itemId: string, @Req() req) {
    return this.itemService.hasUserLikedItem(itemId, req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('inventories/:id/stats')
  getInventoryStats(@Param('id', ParseUUIDPipe) inventoryId: string) {
    return this.itemService.getInventoryStats(inventoryId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Editor')
  @Patch('items/:itemId')
  update(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body(ValidationPipe) updateItemDto: UpdateItemDto,
    @Req() req,
  ) {
    return this.itemService.update(itemId, updateItemDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:itemId/like')
  toggleLike(@Param('itemId', ParseUUIDPipe) itemId: string, @Req() req) {
    return this.itemService.toggleLike(itemId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Editor')
  @Delete('items/:itemId')
  remove(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.itemService.remove(itemId);
  }
}
