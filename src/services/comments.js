const prisma = require('../config/database/prismaClient');
const { errors } = require('../config/api/errorHandler');
const messages = require('../utils/messages');

const commentService = {
  getCommentsByTaskId: async (taskId, userId, userRole) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId, 10) },
      include: {
        project: { select: { id: true, ownerId: true } }
      }
    });

    if (!task) {
      throw errors.notFound(messages.TASK.NOT_FOUND);
    }

    if (
      userRole !== 'admin' &&
      task.assigneeId !== userId &&
      task.project.ownerId !== userId
    ) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: parseInt(taskId, 10) },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return comments;
  },

  createComment: async (taskId, content, userId, userRole) => {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId, 10) },
      include: {
        project: { select: { id: true, ownerId: true } }
      }
    });

    if (!task) {
      throw errors.notFound(messages.TASK.NOT_FOUND);
    }

    if (
      userRole !== 'admin' &&
      task.assigneeId !== userId &&
      task.project.ownerId !== userId
    ) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    return prisma.comment.create({
      data: {
        content,
        taskId: parseInt(taskId, 10),
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  },

  deleteComment: async (commentId, userId, userRole) => {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId, 10) },
      include: {
        task: {
          include: {
            project: { select: { ownerId: true } }
          }
        }
      }
    });

    if (!comment) {
      throw errors.notFound(messages.COMMENT.NOT_FOUND);
    }

    const isAuthor = comment.authorId === userId;
    const isProjectOwner = comment.task.project.ownerId === userId;
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isProjectOwner && !isAdmin) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    return prisma.comment.delete({
      where: { id: parseInt(commentId, 10) }
    });
  }
};

module.exports = commentService;
