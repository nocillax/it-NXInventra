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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { Role } from 'src/common/enums/role.enum';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Post(':id/access')
  addAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) addAccessDto: AddAccessDto,
  ) {
    return this.inventoryService.addAccess(inventoryId, addAccessDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Post(':id/custom-fields')
  async addCustomFields(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) addCustomFieldsDto: AddCustomFieldsDto,
  ) {
    return this.inventoryService.addCustomFields(
      inventoryId,
      addCustomFieldsDto,
    );
  }

  @Public()
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.inventoryService.findAllPublic(page, limit);
  }

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

  // Im pretty sure im not using this anymore
  @Get('search')
  searchInventories(
    @Query(new ValidationPipe({ transform: true }))
    inventoryQueryDto: InventoryQueryDto,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.inventoryService.findWithPagination(inventoryQueryDto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  getInventoryDetails(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    // Pass userId if logged in, else undefined
    return this.inventoryService.getInventoryDetails(id, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Get(':id/access')
  getAccessList(@Param('id', ParseUUIDPipe) inventoryId: string, @Req() req) {
    return this.inventoryService.getAccessList(inventoryId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Get(':id/custom-fields')
  async getCustomFields(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Req() req,
  ) {
    return this.inventoryService.getCustomFields(inventoryId, req.user.id);
  }

  @Get(':id/id-format')
  async getIdFormat(
    @Param('id') inventoryId: string,
  ): Promise<{ format: string }> {
    const format =
      await this.inventoryService.getInventoryIdFormat(inventoryId);
    return { format };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateInventoryDto: UpdateInventoryDto,
    @Req() req,
  ) {
    return this.inventoryService.updateInventory(
      id,
      updateInventoryDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Patch(':id/access/:userId')
  updateAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(ValidationPipe) updateAccessDto: UpdateAccessDto,
  ) {
    return this.inventoryService.updateAccess(
      inventoryId,
      userId,
      updateAccessDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Patch(':id/custom-fields/:fieldId')
  async updateCustomField(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body(ValidationPipe) updateCustomFieldDto: UpdateCustomFieldDto,
  ) {
    return this.inventoryService.updateCustomField(
      inventoryId,
      fieldId,
      updateCustomFieldDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.removeInventory(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Delete(':id/access/:userId')
  removeAccess(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.inventoryService.removeAccess(inventoryId, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Delete(':id/custom-fields/:fieldId')
  async deleteCustomField(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.inventoryService.deleteCustomField(inventoryId, fieldId);
  }
}
