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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('inventories/:id/comments')
  getComments(@Param('id', ParseUUIDPipe) inventoryId: string) {
    return this.commentService.getComments(inventoryId);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  deleteComment(@Param('id', ParseUUIDPipe) commentId: string, @Req() req) {
    return this.commentService.deleteComment(commentId, req.user.id);
  }
}
