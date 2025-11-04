// comment.helpers.ts
// Helper functions for the comment module

import { Comment } from '../../database/entities/comment.entity';

export function paginate(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function mapCommentEntity(comment: Comment) {
  return {
    id: comment.id,
    message: comment.message,
    timestamp: comment.timestamp,
    user: {
      id: comment.user.id,
      name: comment.user.name,
      email: comment.user.email,
    },
  };
}
