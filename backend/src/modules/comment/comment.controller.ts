import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('inventories/:id/comments')
  getComments(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.commentService.getComments(inventoryId, page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Editor')
  @Post('inventories/:id/comments')
  createComment(
    @Param('id', ParseUUIDPipe) inventoryId: string,
    @Body(ValidationPipe) createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    return this.commentService.createComment(
      inventoryId,
      createCommentDto,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner')
  @Delete('comments/:id')
  deleteComment(@Param('id', ParseUUIDPipe) commentId: string) {
    return this.commentService.deleteComment(commentId);
  }
}
