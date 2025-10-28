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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AddAccessDto } from './dto/add-access.dto';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createInventoryDto: CreateInventoryDto,
    @Req() req,
  ) {
    return this.inventoryService.create(createInventoryDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAllPublic();
  }

  @Get('search')
  searchInventories(
    @Query(new ValidationPipe({ transform: true }))
    inventoryQueryDto: InventoryQueryDto,
  ) {
    return this.inventoryService.findWithPagination(inventoryQueryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.inventoryService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateInventoryDto: UpdateInventoryDto,
    @Req() req,
  ) {
    return this.inventoryService.update(id, updateInventoryDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.inventoryService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/access')
  addAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) addAccessDto: AddAccessDto,
    @Req() req,
  ) {
    return this.inventoryService.addAccess(
      inventoryId,
      addAccessDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/access')
  getAccessList(@Param('id', ParseUUIDPipe) inventoryId: string, @Req() req) {
    return this.inventoryService.getAccessList(inventoryId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/access/:userId')
  updateAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(ValidationPipe) updateAccessDto: UpdateAccessDto,
    @Req() req,
  ) {
    return this.inventoryService.updateAccess(
      inventoryId,
      userId,
      updateAccessDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/access/:userId')
  removeAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ) {
    return this.inventoryService.removeAccess(inventoryId, userId, req.user.id);
  }
}
