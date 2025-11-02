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
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AddAccessDto } from './dto/add-access.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-fields.dto';
import { AddCustomFieldsDto } from './dto/add-custom-fields.dto';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req,
  ) {
    return this.inventoryService.findAllPublic(req.user.id, page, limit);
  }

  // Add these new endpoints to the InventoryController class
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMyInventories(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req,
  ) {
    return this.inventoryService.findMyInventories(req.user.id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shared-with-me')
  async findSharedWithMe(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req,
  ) {
    return this.inventoryService.findSharedWithMe(req.user.id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/access/me')
  async getMyAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Req() req,
  ) {
    return this.inventoryService.getMyAccess(inventoryId, req.user.id);
  }

  @Get('search')
  searchInventories(
    @Query(new ValidationPipe({ transform: true }))
    inventoryQueryDto: InventoryQueryDto,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.inventoryService.findWithPagination(inventoryQueryDto, userId);
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

  @UseGuards(JwtAuthGuard)
  @Get(':id/custom-fields')
  async getCustomFields(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Req() req,
  ) {
    return this.inventoryService.getCustomFields(inventoryId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/custom-fields')
  async addCustomFields(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) addCustomFieldsDto: AddCustomFieldsDto,
    @Req() req,
  ) {
    return this.inventoryService.addCustomFields(
      inventoryId,
      addCustomFieldsDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/custom-fields/:fieldId')
  async updateCustomField(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body(ValidationPipe) updateCustomFieldDto: UpdateCustomFieldDto,
    @Req() req,
  ) {
    return this.inventoryService.updateCustomField(
      inventoryId,
      fieldId,
      updateCustomFieldDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/custom-fields/:fieldId')
  async deleteCustomField(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Req() req,
  ) {
    return this.inventoryService.deleteCustomField(
      inventoryId,
      fieldId,
      req.user.id,
    );
  }
}
