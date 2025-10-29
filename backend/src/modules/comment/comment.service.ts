import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../database/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getComments(inventoryId: string): Promise<any[]> {
    const comments = await this.commentRepository.find({
      where: { inventoryId },
      relations: ['user'],
      order: { timestamp: 'ASC' }, // Linear order, oldest first
    });

    return comments.map((comment) => ({
      id: comment.id,
      message: comment.message,
      timestamp: comment.timestamp,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
      },
    }));
  }

  async createComment(
    inventoryId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      inventoryId,
      userId,
      message: createCommentDto.message,
    });

    return this.commentRepository.save(comment);
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['inventory'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Basic check: only inventory creator can delete comments
    // This will be replaced with RoleGuard later
    if (comment.inventory.createdBy !== userId) {
      throw new ForbiddenException('Only inventory owner can delete comments');
    }

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
