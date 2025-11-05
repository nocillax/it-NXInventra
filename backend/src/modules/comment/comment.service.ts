import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../database/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { paginate, mapCommentEntity } from './comment.helpers';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getComments(
    inventoryId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: any[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { inventoryId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
      skip,
      take: limit,
    });
    return {
      comments: comments.map(mapCommentEntity),
      pagination: paginate(page, limit, total),
    };
  }

  async createComment(
    inventoryId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    return this.commentRepository.save(
      this.commentRepository.create({
        inventoryId,
        userId,
        message: createCommentDto.message,
      }),
    );
  }

  async deleteComment(commentId: string): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['inventory'],
    });
    if (!comment) throw new NotFoundException('Comment not found');

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
